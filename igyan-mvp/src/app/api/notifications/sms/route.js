import { NextResponse } from "next/server";

/**
 * SMS Notification Service API
 * 
 * Handles SMS notifications for:
 * - Absence alerts (within 1 minute)
 * - Weekly attendance reports (Friday)
 * - Emergency alerts
 * - General notifications
 * 
 * Supports: Twilio, MSG91
 * 
 * Environment Variables Required:
 * - SMS_PROVIDER (twilio|msg91)
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 * - MSG91_AUTH_KEY
 * - MSG91_SENDER_ID
 */

// Twilio SMS Send Function
async function sendViaTwilio(to, message) {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const fromNumber = process.env.TWILIO_PHONE_NUMBER;

	if (!accountSid || !authToken || !fromNumber) {
		throw new Error("Twilio credentials not configured");
	}

	const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
	
	const formData = new URLSearchParams();
	formData.append('To', to);
	formData.append('From', fromNumber);
	formData.append('Body', message);

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formData.toString(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Twilio Error: ${error.message || 'Unknown error'}`);
	}

	return await response.json();
}

// MSG91 SMS Send Function
async function sendViaMSG91(to, message, templateId = null) {
	const authKey = process.env.MSG91_AUTH_KEY;
	const senderId = process.env.MSG91_SENDER_ID;

	if (!authKey || !senderId) {
		throw new Error("MSG91 credentials not configured");
	}

	// Remove country code if present and add +91
	const phoneNumber = to.startsWith('+') ? to : `+91${to}`;

	const url = 'https://api.msg91.com/api/v5/flow/';
	
	const payload = {
		sender: senderId,
		mobiles: phoneNumber,
		message: message,
		route: '4', // Transactional route
	};

	if (templateId) {
		payload.template_id = templateId;
	}

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'authkey': authKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`MSG91 Error: ${error.message || 'Unknown error'}`);
	}

	return await response.json();
}

/**
 * POST /api/notifications/sms
 * 
 * Body:
 * {
 *   type: 'absence_alert' | 'weekly_report' | 'emergency' | 'general',
 *   recipients: [{ phone: string, name: string, studentName?: string }],
 *   message?: string, // For general notifications
 *   data?: any // Additional data for template
 * }
 */
export async function POST(request) {
	try {
		const body = await request.json();
		const { type, recipients, message: customMessage, data } = body;

		if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
			return NextResponse.json(
				{ success: false, error: 'Recipients array is required' },
				{ status: 400 }
			);
		}

		const provider = process.env.SMS_PROVIDER || 'twilio';
		const results = [];

		for (const recipient of recipients) {
			try {
				let message = customMessage;
				const recipientData = { ...data, ...recipient.data };

				// Generate message based on type if not provided
				if (!message) {
					switch (type) {
						case 'absence_alert':
							message = `Dear ${recipient.name}, your child ${recipient.studentName || 'student'} is marked absent today at ${recipientData.schoolName || 'school'}. If this is an error, please contact the class teacher immediately. - I-GYAN School OS`;
							break;
						
						case 'weekly_report':
							message = `Weekly Attendance Report for ${recipient.studentName}:\nPresent: ${recipientData.present || 0} days\nAbsent: ${recipientData.absent || 0} days\nAttendance: ${recipientData.percentage || 0}%\n- I-GYAN School OS`;
							break;
						
						case 'emergency':
							message = `URGENT: ${recipientData.emergencyMessage || 'Emergency alert from school'}. Please contact school immediately. - I-GYAN School OS`;
							break;
						
						case 'general':
							message = customMessage || `Notification from ${recipientData.schoolName || 'school'}. - I-GYAN School OS`;
							break;
						
						default:
							message = `Notification from ${recipientData.schoolName || 'school'}. - I-GYAN School OS`;
					}
				}

				let result;
				if (provider === 'twilio') {
					result = await sendViaTwilio(recipient.phone, message);
				} else if (provider === 'msg91') {
					result = await sendViaMSG91(recipient.phone, message, recipientData.templateId);
				} else {
					throw new Error('Invalid SMS provider configured');
				}

				results.push({
					success: true,
					recipient: recipient.phone,
					name: recipient.name,
					messageId: result.sid || result.request_id,
					timestamp: new Date().toISOString(),
				});

				// Log notification to database (you'll need to implement this)
				// await logNotification({
				// 	type,
				// 	recipient: recipient.phone,
				// 	message,
				// 	status: 'sent',
				// 	provider,
				// });

			} catch (error) {
				results.push({
					success: false,
					recipient: recipient.phone,
					name: recipient.name,
					error: error.message,
					timestamp: new Date().toISOString(),
				});

				// Log failed notification
				// await logNotification({
				// 	type,
				// 	recipient: recipient.phone,
				// 	message,
				// 	status: 'failed',
				// 	provider,
				// 	error: error.message,
				// });
			}
		}

		const successCount = results.filter(r => r.success).length;
		const failureCount = results.filter(r => !r.success).length;

		return NextResponse.json({
			success: true,
			message: `Sent ${successCount} SMS, ${failureCount} failed`,
			results,
			summary: {
				total: recipients.length,
				sent: successCount,
				failed: failureCount,
			},
		});

	} catch (error) {
		console.error('SMS API Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to send SMS notifications',
			},
			{ status: 500 }
		);
	}
}

/**
 * GET /api/notifications/sms?phone=+1234567890
 * 
 * Get notification history for a phone number
 */
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const phone = searchParams.get('phone');
		const type = searchParams.get('type');
		const limit = parseInt(searchParams.get('limit') || '50');

		// TODO: Implement database query to fetch notification logs
		// const logs = await getNotificationLogs({ phone, type, limit });

		return NextResponse.json({
			success: true,
			message: 'Feature coming soon - notification logs',
			// logs,
		});

	} catch (error) {
		console.error('SMS Log Fetch Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to fetch notification logs',
			},
			{ status: 500 }
		);
	}
}
