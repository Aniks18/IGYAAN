"use client";

import { useState } from "react";
import { supabase } from "../../../utils/supabase";
import DatePicker from "../../../../components/ui/DatePicker";
import { Modal, Badge, inputClass, labelClass, cardClass, btnPrimary, btnSecondary, btnDanger, btnGhost, thClass, tdClass, tdBold, emptyClass, alertError } from "./shared";

export default function SessionsTab({ schoolId, sessions, onRefresh }) {
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ session_name: "", start_date: "", end_date: "" });
	const [error, setError] = useState("");

	const handleAdd = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		try {
			const { error: err } = await supabase.from("academic_sessions").insert([{
				school_id: schoolId,
				session_name: form.session_name,
				start_date: form.start_date,
				end_date: form.end_date,
				is_active: sessions.length === 0,
			}]);
			if (err) throw err;
			setForm({ session_name: "", start_date: "", end_date: "" });
			setShowModal(false);
			onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const setActive = async (id) => {
		await supabase.from("academic_sessions").update({ is_active: false }).eq("school_id", schoolId);
		await supabase.from("academic_sessions").update({ is_active: true }).eq("id", id);
		onRefresh();
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this session? This will also delete linked classes, enrollments, and attendance.")) return;
		await supabase.from("academic_sessions").delete().eq("id", id);
		onRefresh();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Academic Sessions</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage your academic years and terms</p>
				</div>
				<button onClick={() => setShowModal(true)} className={btnPrimary}>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
					Add Session
				</button>
			</div>

			<div className={cardClass + " p-0! overflow-hidden"}>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
							<tr>
								<th className={thClass}>Session Name</th>
								<th className={thClass}>Start Date</th>
								<th className={thClass}>End Date</th>
								<th className={thClass}>Status</th>
								<th className={thClass + " text-right"}>Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{sessions.map((s) => (
								<tr key={s.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
									<td className={tdBold}>{s.session_name}</td>
									<td className={tdClass}>{s.start_date}</td>
									<td className={tdClass}>{s.end_date}</td>
									<td className={tdClass}>
										<Badge color={s.is_active ? "green" : "zinc"}>{s.is_active ? "Active" : "Inactive"}</Badge>
									</td>
									<td className={tdClass + " text-right"}>
										<div className="flex items-center justify-end gap-1">
											{!s.is_active && <button onClick={() => setActive(s.id)} className={btnGhost}>Set Active</button>}
											<button onClick={() => handleDelete(s.id)} className={btnDanger}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{sessions.length === 0 && (
								<tr><td colSpan={5} className={emptyClass}>
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">📅</div>
									No sessions yet. Create your first academic session.
								</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Modal open={showModal} onClose={() => { setShowModal(false); setError(""); }} title="Add Academic Session">
				{error && <div className={alertError}><span>⚠</span> {error}</div>}
				<form onSubmit={handleAdd} className="space-y-4">
					<div>
						<label className={labelClass}>Session Name <span className="text-red-500">*</span></label>
						<input type="text" placeholder="e.g. 2025-2026" value={form.session_name} onChange={(e) => setForm({ ...form, session_name: e.target.value })} className={inputClass} required />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelClass}>Start Date <span className="text-red-500">*</span></label>
							<DatePicker
								required
								value={form.start_date}
								onChange={(val) => setForm({ ...form, start_date: val })}
								placeholder="dd/mm/yyyy"
							/>
						</div>
						<div>
							<label className={labelClass}>End Date <span className="text-red-500">*</span></label>
							<DatePicker
								required
								value={form.end_date}
								onChange={(val) => setForm({ ...form, end_date: val })}
								placeholder="dd/mm/yyyy"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
						<button type="button" onClick={() => { setShowModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
						<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving..." : "Create Session"}</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
