import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase";

/**
 * Automated Attendance Notification Trigger
 * 
 * This API should be called:
 * 1. When teacher confirms attendance (1-minute trigger for absence alerts)
 * 2. Via cron job every Friday at 5 PM (weekly reports)
 * 
 * POST /api/notifications/trigger-attendance
 * 
 * Body:
 * {
 *   type: 'absence_alert' | 'weekly_report',
 *   schoolId: string,
 *   classId?: string, // For absence alerts
 *   sectionId?: string, // For absence alerts
 *   date?: string, // For absence alerts (YYYY-MM-DD)
 * }
 */
export async function POST(request) {
	try {
		const supabase = createClient();
		const body = await request.json();
		const { type, schoolId, classId, sectionId, date } = body;

		if (!type || !schoolId) {
			return NextResponse.json(
				{ success: false, error: 'Type and schoolId are required' },
				{ status: 400 }
			);
		}

		if (type === 'absence_alert') {
			return await sendAbsenceAlerts(supabase, { schoolId, classId, sectionId, date });
		} else if (type === 'weekly_report') {
			return await sendWeeklyReports(supabase, { schoolId });
		} else {
			return NextResponse.json(
				{ success: false, error: 'Invalid notification type' },
				{ status: 400 }
			);
		}

	} catch (error) {
		console.error('Trigger Notification Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to trigger notifications',
			},
			{ status: 500 }
		);
	}
}

/**
 * Send absence alerts to parents (within 1 minute)
 */
async function sendAbsenceAlerts(supabase, { schoolId, classId, sectionId, date }) {
	const targetDate = date || new Date().toISOString().split('T')[0];

	// Fetch today's absent students
	let attendanceQuery = supabase
		.from('student_attendance_v2')
		.select(`
			student_id,
			classes(class_name, section)
		`)
		.eq('attendance_date', targetDate)
		.eq('status', 'absent')
		.eq('school_id', schoolId);
	if (classId) attendanceQuery = attendanceQuery.eq('class_id', classId);
	const { data: attendanceRecords, error: attendanceError } = await attendanceQuery;

	if (attendanceError) throw attendanceError;

	if (!attendanceRecords || attendanceRecords.length === 0) {
		return NextResponse.json({
			success: true,
			message: 'No absent students found',
			sent: 0,
		});
	}

	const absentRecords = sectionId
		? attendanceRecords.filter((record) => record.classes?.section === sectionId)
		: attendanceRecords;
	if (absentRecords.length === 0) {
		return NextResponse.json({ success: true, message: 'No absent students found', sent: 0 });
	}
	const studentIds = absentRecords.map((record) => record.student_id);
	const [{ data: students, error: studentsError }, { data: assignments, error: assignmentsError }] = await Promise.all([
		supabase.from('users').select('id, full_name').in('id', studentIds),
		supabase.from('parent_student_assignments').select('student_id, parent:parent_id(id, full_name, phone)').eq('school_id', schoolId).in('student_id', studentIds),
	]);
	if (studentsError) throw studentsError;
	if (assignmentsError) throw assignmentsError;
	const studentById = new Map((students || []).map((student) => [student.id, student]));
	const parentsByStudent = new Map();
	for (const assignment of assignments || []) {
		if (!parentsByStudent.has(assignment.student_id)) parentsByStudent.set(assignment.student_id, assignment.parent);
	}

	// Get school details
	const { data: school } = await supabase
		.from('schools')
		.select('school_name')
		.eq('id', schoolId)
		.single();

	// Prepare SMS and app notifications
	const smsRecipients = [];
	const appNotificationUserIds = [];

	for (const studentId of studentIds) {
		const student = studentById.get(studentId);
		const parent = parentsByStudent.get(studentId);
		if (!student || !parent) continue;
		
		if (parent.phone) {
			smsRecipients.push({
				phone: parent.phone,
				name: parent.full_name || 'Parent',
				studentName: student.full_name,
			});
		}

		appNotificationUserIds.push(parent.id);
	}

	const results = {
		sms: null,
		app: null,
	};

	// Send SMS notifications
	if (smsRecipients.length > 0) {
		const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/sms`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'absence_alert',
				recipients: smsRecipients,
				data: {
					schoolName: school?.school_name || 'School',
					date: targetDate,
				},
			}),
		});
		results.sms = await smsResponse.json();
	}

	// Send app notifications
	if (appNotificationUserIds.length > 0) {
		const appResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/app`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'absence_alert',
				userIds: appNotificationUserIds,
				title: 'Absence Alert',
				message: `Your child was marked absent today. If this is an error, please contact the class teacher.`,
				priority: 'high',
				actionUrl: '/dashboard/parent/attendance/alerts',
				data: {
					date: targetDate,
				},
			}),
		});
		results.app = await appResponse.json();
	}

	return NextResponse.json({
		success: true,
		message: `Sent ${absentRecords.length} absence alerts`,
		details: {
			totalAbsent: absentRecords.length,
			smsSent: smsRecipients.length,
			appNotifications: appNotificationUserIds.length,
		},
		results,
	});
}

/**
 * Send weekly attendance reports to all parents (every Friday)
 */
async function sendWeeklyReports(supabase, { schoolId }) {
	const today = new Date();
	const lastFriday = new Date(today);
	lastFriday.setDate(today.getDate() - 7);

	const endDate = today.toISOString().split('T')[0];
	const startDate = lastFriday.toISOString().split('T')[0];

	// Students are user records; their parents are linked separately.
	const { data: students, error: studentsError } = await supabase
		.from('users')
		.select('id, full_name')
		.eq('school_id', schoolId)
		.eq('role', 'student');

	if (studentsError) throw studentsError;

	if (!students || students.length === 0) {
		return NextResponse.json({
			success: true,
			message: 'No students found',
		});
	}

	// Get school details
	const { data: school } = await supabase
		.from('schools')
		.select('school_name')
		.eq('id', schoolId)
		.single();

	const studentIds = students.map((student) => student.id);
	const [{ data: attendanceData, error: attendanceError }, { data: assignments, error: assignmentsError }] = await Promise.all([
		supabase
			.from('student_attendance_v2')
			.select('student_id, status')
			.in('student_id', studentIds)
			.gte('attendance_date', startDate)
			.lte('attendance_date', endDate),
		supabase
			.from('parent_student_assignments')
			.select('student_id, parent:parent_id(id, full_name, phone)')
			.eq('school_id', schoolId)
			.in('student_id', studentIds),
	]);
	if (attendanceError) throw attendanceError;
	if (assignmentsError) throw assignmentsError;
	const attendanceByStudent = new Map();
	for (const record of attendanceData || []) {
		const records = attendanceByStudent.get(record.student_id) || [];
		records.push(record);
		attendanceByStudent.set(record.student_id, records);
	}
	const parentsByStudent = new Map();
	for (const assignment of assignments || []) {
		if (!parentsByStudent.has(assignment.student_id)) parentsByStudent.set(assignment.student_id, assignment.parent);
	}
	const smsRecipients = [];
	const appNotificationUserIds = new Set();

	for (const student of students) {
		const parent = parentsByStudent.get(student.id);
		if (!parent) continue;
		const records = attendanceByStudent.get(student.id) || [];
		const present = records.filter((record) => record.status === 'present').length;
		const absent = records.length - present;
		const percentage = records.length ? Math.round((present / records.length) * 100) : 0;
		if (parent.phone) {
			smsRecipients.push({
				phone: parent.phone,
				name: parent.full_name || 'Parent',
				studentName: student.full_name,
				data: { present, absent, percentage },
			});
		}
		appNotificationUserIds.add(parent.id);
	}

	const results = {
		sms: null,
		app: null,
	};

	// Send SMS notifications
	if (smsRecipients.length > 0) {
		// Note: For weekly reports, you might want to batch these or send fewer details
		const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/sms`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'weekly_report',
				recipients: smsRecipients.slice(0, 100), // Limit for safety
				data: {
					schoolName: school?.school_name || 'School',
				},
			}),
		});
		results.sms = await smsResponse.json();
	}

	// Send app notifications (all parents)
	if (appNotificationUserIds.size > 0) {
		const appResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/app`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'weekly_report',
				userIds: [...appNotificationUserIds],
				title: 'Weekly Attendance Report',
				message: `Your child's attendance report for the week is now available.`,
				priority: 'medium',
				actionUrl: '/dashboard/parent/attendance/weekly',
				data: {
					startDate,
					endDate,
				},
			}),
		});
		results.app = await appResponse.json();
	}

	return NextResponse.json({
		success: true,
		message: `Sent ${students.length} weekly reports`,
		details: {
			totalStudents: students.length,
			smsSent: Math.min(smsRecipients.length, 100),
			appNotifications: appNotificationUserIds.size,
			period: `${startDate} to ${endDate}`,
		},
		results,
	});
}
