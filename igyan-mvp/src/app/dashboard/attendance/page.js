"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import DatePicker from "../../../components/ui/DatePicker";

const ALLOWED_ROLES = ["super_admin", "co_admin", "faculty"];

export default function AttendancePage() {
const { user, loading } = useAuth();
const router = useRouter();
const [classes, setClasses] = useState([]);
const [activeSession, setActiveSession] = useState(null);
const [selectedClass, setSelectedClass] = useState("");
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
const [students, setStudents] = useState([]);
const [attendanceMap, setAttendanceMap] = useState({});
const [view, setView] = useState("mark");
const [history, setHistory] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [showStats, setShowStats] = useState(false);

useEffect(() => {
if (!loading && !user) router.push("/login");
else if (!loading && user && !ALLOWED_ROLES.includes(user.role)) router.push("/dashboard");
}, [user, loading, router]);

// Fetch active session and classes (filtered by faculty_assignments for faculty)
useEffect(() => {
if (user && ALLOWED_ROLES.includes(user.role) && user.school_id) {
fetchSessionAndClasses();
}
}, [user]);

const fetchSessionAndClasses = async () => {
try {
setIsLoading(true);

// Get active session
const { data: sessions } = await supabase.from("academic_sessions").select("*").eq("school_id", user.school_id).eq("is_active", true).limit(1);
const session = sessions?.[0] || null;
setActiveSession(session);
if (!session) { setIsLoading(false); return; }

// Get classes — filtered for faculty
if (user.role === "faculty") {
const { data: assignments } = await supabase.from("faculty_assignments").select("class_id, classes(id, class_name, section)").eq("faculty_id", user.id).eq("session_id", session.id).eq("is_active", true);
const uniqueClasses = [];
const seenIds = new Set();
(assignments || []).forEach((a) => {
if (a.classes && !seenIds.has(a.classes.id)) {
seenIds.add(a.classes.id);
uniqueClasses.push(a.classes);
}
});
setClasses(uniqueClasses);
} else {
const { data: allClasses } = await supabase.from("classes").select("*").eq("school_id", user.school_id).eq("session_id", session.id).eq("is_active", true).order("class_name");
setClasses(allClasses || []);
}
} catch (err) { console.error(err); }
finally { setIsLoading(false); }
};

// Fetch students & existing attendance when class/date changes
useEffect(() => {
if (selectedClass && activeSession && selectedDate) fetchAttendanceData();
}, [selectedClass, activeSession, selectedDate]);

const fetchAttendanceData = async () => {
setIsLoading(true);
try {
const [classStudentRes, attRes] = await Promise.all([
supabase.from("class_students").select("*, users:student_id(id, full_name, email)").eq("class_id", selectedClass).eq("session_id", activeSession.id).eq("status", "active").order("roll_number"),
supabase.from("student_attendance_v2").select("*").eq("class_id", selectedClass).eq("attendance_date", selectedDate)
]);

const classStudentData = classStudentRes.data || [];
const attData = attRes.data || [];
setStudents(classStudentData);

const map = {};
classStudentData.forEach((cs) => {
const existing = attData.find((a) => a.student_id === cs.student_id);
map[cs.student_id] = existing ? existing.status : "present";
});
setAttendanceMap(map);
} catch (err) { console.error(err); }
finally { setIsLoading(false); }
};

const toggleAttendance = (studentId) => {
setAttendanceMap((prev) => ({
...prev,
[studentId]: prev[studentId] === "present" ? "absent" : prev[studentId] === "absent" ? "late" : "present",
}));
};

const markAllPresent = () => {
const newMap = {};
students.forEach((cs) => { newMap[cs.student_id] = "present"; });
setAttendanceMap(newMap);
};

const handleSaveAttendance = async () => {
if (!selectedClass || !activeSession) { alert("Please select a class"); return; }
setSaving(true);
try {
// Delete existing records for this class/date
await supabase.from("student_attendance_v2").delete().eq("class_id", selectedClass).eq("attendance_date", selectedDate);

// Insert new records
const records = students.map((cs) => ({
school_id: user.school_id, class_id: selectedClass, student_id: cs.student_id,
session_id: activeSession.id, attendance_date: selectedDate,
status: attendanceMap[cs.student_id] || "present", marked_by: user.id,
}));

if (records.length > 0) {
const { error } = await supabase.from("student_attendance_v2").insert(records);
if (error) throw error;
}

setShowStats(true);
setTimeout(() => setShowStats(false), 3000);
} catch (err) {
alert("Failed to save: " + err.message);
} finally { setSaving(false); }
};

// Fetch history
useEffect(() => {
if (view === "history" && selectedClass && activeSession) fetchHistory();
}, [view, selectedClass]);

const fetchHistory = async () => {
try {
const { data } = await supabase.from("student_attendance_v2").select("*, users:student_id(full_name)").eq("class_id", selectedClass).eq("session_id", activeSession.id).order("attendance_date", { ascending: false });
setHistory(data || []);
} catch (err) { console.error(err); }
};

// Calculate stats with memoization
const presentCount = Object.values(attendanceMap).filter((v) => v === "present").length;
const absentCount = Object.values(attendanceMap).filter((v) => v === "absent").length;
const lateCount = Object.values(attendanceMap).filter((v) => v === "late").length;
const totalStudents = students.length;

// Group history by date
const historyByDate = {};
history.forEach((h) => {
if (!historyByDate[h.attendance_date]) historyByDate[h.attendance_date] = [];
historyByDate[h.attendance_date].push(h);
});

const selectedClassInfo = classes.find((c) => c.id === selectedClass);

if (loading || (!user)) return (
<div className="flex min-h-screen items-center justify-center">
<div className="text-center">
<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading...</p>
</div>
</div>
);

if (!ALLOWED_ROLES.includes(user?.role)) return null;

return (
<div className="p-6 lg:p-8">
{/* Header */}
<div className="mb-8">
<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Smart Attendance System</h1>
<p className="mt-2 text-zinc-600 dark:text-zinc-400">
{user.role === "faculty" ? "Mark attendance for your assigned classes" : "Mark and manage attendance across all classes"}
</p>
{activeSession && <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Session: {activeSession.session_name}</p>}
</div>

{/* View Tabs */}
<div className="mb-6 flex gap-2 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
<button onClick={() => setView("mark")} className={"flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all " + (view === "mark" ? "bg-indigo-500 text-white shadow-md" : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800")}>Mark Attendance</button>
<button onClick={() => setView("history")} className={"flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all " + (view === "history" ? "bg-indigo-500 text-white shadow-md" : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800")}>Attendance History</button>
</div>

{/* Class and Date Selection */}
<div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Select Class</h3>
<div className="grid gap-4 sm:grid-cols-2">
<div>
<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Class</label>
<select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
<option value="">Select Class</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
{classes.length === 0 && !isLoading && <p className="mt-2 text-xs text-amber-600">{user.role === "faculty" ? "No classes assigned to you." : "No classes found for this session."}</p>}
</div>
{view === "mark" && (
<div>
<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
<DatePicker
value={selectedDate}
onChange={(val) => setSelectedDate(val)}
max={new Date().toISOString().split("T")[0]}
className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
/>
</div>
)}
</div>
</div>

{/* Success Message */}
{showStats && (
<div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
<div className="flex items-center gap-3">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-green-600 dark:text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
<p className="font-semibold text-green-900 dark:text-green-200">Attendance saved successfully!</p>
</div>
</div>
)}

{view === "mark" ? (
<>
{/* Stats */}
{selectedClass && totalStudents > 0 && (
<div className="mb-6 grid gap-4 sm:grid-cols-4">
<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
<div className="flex items-center gap-3">
<div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30"><span className="text-xl">&#128101;</span></div>
<div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalStudents}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p></div>
</div>
</div>
<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
<div className="flex items-center gap-3">
<div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30"><span className="text-xl">&#9989;</span></div>
<div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{presentCount}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">Present ({totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%)</p></div>
</div>
</div>
<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
<div className="flex items-center gap-3">
<div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30"><span className="text-xl">&#10060;</span></div>
<div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{absentCount}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">Absent ({totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}%)</p></div>
</div>
</div>
<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
<div className="flex items-center gap-3">
<div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30"><span className="text-xl">&#9200;</span></div>
<div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{lateCount}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">Late</p></div>
</div>
</div>
</div>
)}

{/* Attendance Table */}
{selectedClass && students.length > 0 ? (
<div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
<div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
<div className="flex items-center justify-between">
<div>
<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Mark Attendance</h3>
<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
{selectedClassInfo ? selectedClassInfo.class_name + "-" + selectedClassInfo.section : ""} &#8226; {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
</p>
</div>
<div className="flex gap-2">
<button onClick={markAllPresent} className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20">&#10003; Mark All Present</button>
<button onClick={handleSaveAttendance} disabled={saving} className="rounded-lg bg-indigo-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600">{saving ? "Saving..." : "Save Attendance"}</button>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full">
<thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
<tr>
<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">Roll No</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">Student Name</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">Email</th>
<th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">Status</th>
<th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">Toggle</th>
</tr>
</thead>
<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
{students.map((cs) => {
const status = attendanceMap[cs.student_id] || "present";
return (
<tr key={cs.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
<td className="px-6 py-4 text-sm font-medium font-mono text-zinc-900 dark:text-white">{cs.roll_number || "\u2014"}</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
{cs.users?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
</div>
<span className="font-medium text-zinc-900 dark:text-white">{cs.users?.full_name}</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{cs.users?.email}</td>
<td className="px-6 py-4">
<div className="flex justify-center">
<span className={"inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold " + (
status === "present" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
status === "absent" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
)}>
{status === "present" && "\u2713"}{status === "absent" && "\u2717"}{status === "late" && "\u23F0"} {status.charAt(0).toUpperCase() + status.slice(1)}
</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex justify-center">
<button onClick={() => toggleAttendance(cs.student_id)} className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Toggle</button>
</div>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
</div>
) : selectedClass && !isLoading ? (
<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
<div className="mx-auto mb-4 text-4xl">&#128203;</div>
<p className="text-lg font-semibold text-zinc-900 dark:text-white">No Students Found</p>
<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No students are enrolled in this class yet.</p>
</div>
) : !selectedClass ? (
<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
<div className="mx-auto mb-4 text-4xl">&#128203;</div>
<p className="text-lg font-semibold text-zinc-900 dark:text-white">Select Class Details</p>
<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Choose a class and date to mark attendance</p>
</div>
) : null}
</>
) : (
<>
{/* History */}
{selectedClass ? (
<div className="space-y-4">
{Object.keys(historyByDate).length === 0 ? (
<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
<div className="mx-auto mb-4 text-4xl">&#128202;</div>
<p className="text-lg font-semibold text-zinc-900 dark:text-white">No Attendance Records</p>
<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Start marking attendance to see history.</p>
</div>
) : Object.entries(historyByDate).map(([date, records]) => {
const p = records.filter((r) => r.status === "present").length;
const a = records.filter((r) => r.status === "absent").length;
const l = records.filter((r) => r.status === "late").length;
const total = records.length;
const pct = total > 0 ? Math.round((p / total) * 100) : 0;
return (
<div key={date} className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
<div className="flex items-start justify-between">
<div className="flex-1">
<div className="flex items-center gap-3">
<div className="text-3xl">&#128197;</div>
<div>
<h4 className="text-lg font-semibold text-zinc-900 dark:text-white">Attendance Record</h4>
<p className="text-sm text-zinc-600 dark:text-zinc-400">
{selectedClassInfo ? selectedClassInfo.class_name + "-" + selectedClassInfo.section : ""} &#8226; {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
</p>
</div>
</div>
<div className="mt-4 flex gap-6">
<div><p className="text-2xl font-bold text-green-600 dark:text-green-400">{p}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Present</p></div>
<div><p className="text-2xl font-bold text-red-600 dark:text-red-400">{a}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Absent</p></div>
<div><p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{l}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Late</p></div>
</div>
</div>
<div className="text-right">
<div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
<span className="text-sm font-semibold text-zinc-900 dark:text-white">{total} Students</span>
</div>
<p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{pct}% attendance</p>
</div>
</div>
<div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
<div className="flex h-full">
<div className="bg-green-500" style={{ width: (p / total * 100) + "%" }}></div>
<div className="bg-amber-500" style={{ width: (l / total * 100) + "%" }}></div>
<div className="bg-red-500" style={{ width: (a / total * 100) + "%" }}></div>
</div>
</div>
{a > 0 && (
<div className="mt-3 flex flex-wrap gap-1.5">
{records.filter((r) => r.status !== "present").map((r) => (
<span key={r.id} className={"inline-flex rounded-full px-2.5 py-1 text-xs font-medium " + (r.status === "absent" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}>
{r.users?.full_name} {"\u2014"} {r.status}
</span>
))}
</div>
)}
</div>
);
})}
</div>
) : (
<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
<div className="mx-auto mb-4 text-4xl">&#128202;</div>
<p className="text-lg font-semibold text-zinc-900 dark:text-white">Select a Class</p>
<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Choose a class above to view attendance history.</p>
</div>
)}
</>
)}

{isLoading && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
<div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading...</p>
</div>
</div>
)}
</div>
);
}
