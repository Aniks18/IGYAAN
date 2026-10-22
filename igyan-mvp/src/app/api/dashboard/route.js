import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabase";

const noStore = { "Cache-Control": "no-store" };

function buildRegistrationTrend(registrations) {
	const months = Array.from({ length: 6 }, (_, index) => {
		const date = new Date();
		date.setDate(1);
		date.setMonth(date.getMonth() - (5 - index));
		return {
			key: `${date.getFullYear()}-${date.getMonth()}`,
			label: date.toLocaleString("en", { month: "short", year: "numeric" }),
			value: 0,
		};
	});
	const byMonth = Object.fromEntries(months.map((month) => [month.key, month]));
	for (const registration of registrations) {
		if (registration.status === "cancelled" || !registration.registered_at) continue;
		const date = new Date(registration.registered_at);
		const month = byMonth[`${date.getFullYear()}-${date.getMonth()}`];
		if (month) month.value += 1;
	}
	return months.map(({ label, value }) => ({ label, value }));
}

function unauthorized(message = "Authentication is required.") {
	return NextResponse.json({ error: message }, { status: 401, headers: noStore });
}

export async function GET(request) {
	try {
		const authorization = request.headers.get("authorization") || "";
		const sessionToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
		if (!sessionToken || sessionToken.length > 512) return unauthorized();

		const { data: session, error: sessionError } = await supabase
			.from("sessions")
			.select("user_id, expires_at")
			.eq("session_token", sessionToken)
			.eq("is_active", true)
			.maybeSingle();
		if (sessionError || !session || new Date(session.expires_at) <= new Date()) {
			return unauthorized("Your session has expired. Please sign in again.");
		}

		const { data: user, error: userError } = await supabase
			.from("users")
			.select("id, full_name, role, school_id")
			.eq("id", session.user_id)
			.maybeSingle();
		if (userError || !user) return unauthorized();

		const base = {
			user: { id: user.id, fullName: user.full_name, role: user.role, schoolId: user.school_id },
			metrics: { students: 0, faculty: 0, parents: 0, events: 0, upcomingEvents: 0, registrations: 0 },
			events: [],
			myRegistrations: [],
			charts: { registrationsByMonth: [], eventsByStatus: [] },
		};

		const canReadSchoolMetrics = ["super_admin", "co_admin", "principal", "faculty", "teacher"].includes(user.role);
		if (!user.school_id || !canReadSchoolMetrics) {
			const [{ data: registrations, error: registrationsError }, { data: events, error: eventsError }] = await Promise.all([
				supabase
				.from("event_registrations")
				.select("id, event_id, status, registered_at")
				.eq("user_id", user.id)
				.order("registered_at", { ascending: false })
				.limit(10),
				user.school_id
					? supabase.from("events").select("id, title, start_date, end_date, location, status, max_participants, is_public").eq("school_id", user.school_id).order("start_date", { ascending: true }).limit(10)
					: Promise.resolve({ data: [], error: null }),
			]);
			if (registrationsError) throw registrationsError;
			if (eventsError) throw eventsError;
			return NextResponse.json({ ...base, events: events || [], myRegistrations: registrations || [] }, { headers: noStore });
		}

		const [{ data: people, error: peopleError }, { data: events, error: eventsError }] = await Promise.all([
			supabase.from("users").select("role").eq("school_id", user.school_id),
			supabase.from("events").select("id, title, start_date, end_date, location, status, max_participants, is_public").eq("school_id", user.school_id).order("start_date", { ascending: true }),
		]);
		if (peopleError) throw peopleError;
		if (eventsError) throw eventsError;

		const eventIds = (events || []).map((event) => event.id);
		const { data: registrations, error: registrationsError } = eventIds.length
			? await supabase.from("event_registrations").select("event_id, status, registered_at").in("event_id", eventIds)
			: { data: [], error: null };
		if (registrationsError) throw registrationsError;

		const registrationCounts = (registrations || []).reduce((counts, registration) => {
			if (registration.status !== "cancelled") counts[registration.event_id] = (counts[registration.event_id] || 0) + 1;
			return counts;
		}, {});
		const now = Date.now();
		const dashboardEvents = (events || []).map((event) => ({
			...event,
			registeredCount: registrationCounts[event.id] || 0,
			available: Number.isFinite(Number(event.max_participants))
				? Math.max(0, Number(event.max_participants) - (registrationCounts[event.id] || 0))
				: null,
		}));
		const roleCounts = (people || []).reduce((counts, person) => {
			counts[person.role] = (counts[person.role] || 0) + 1;
			return counts;
		}, {});
		const eventStatusCounts = dashboardEvents.reduce((counts, event) => {
			const status = event.status || "scheduled";
			counts[status] = (counts[status] || 0) + 1;
			return counts;
		}, {});

		return NextResponse.json({
			...base,
			metrics: {
				students: roleCounts.student || 0,
				faculty: (roleCounts.faculty || 0) + (roleCounts.teacher || 0),
				parents: roleCounts.parent || 0,
				events: dashboardEvents.length,
				upcomingEvents: dashboardEvents.filter((event) => new Date(event.start_date).getTime() >= now && !["completed", "cancelled"].includes(event.status)).length,
				registrations: Object.values(registrationCounts).reduce((total, count) => total + count, 0),
			},
			events: dashboardEvents.slice(0, 10),
			charts: {
				registrationsByMonth: buildRegistrationTrend(registrations || []),
				eventsByStatus: Object.entries(eventStatusCounts).map(([label, value]) => ({ label, value })),
			},
		}, { headers: noStore });
	} catch (error) {
		console.error("Dashboard data API error:", error);
		return NextResponse.json({ error: "Unable to load dashboard data right now." }, { status: 500, headers: noStore });
	}
}
