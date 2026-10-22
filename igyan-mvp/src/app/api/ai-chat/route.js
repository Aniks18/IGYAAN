import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabase";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 12000;

export async function POST(request) {
	try {
		const { messages, temperature = 0.7, max_tokens: maxTokens = 1000, json = false, sessionToken } = await request.json();
		if (!sessionToken) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
		if (!Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES) {
			return NextResponse.json({ error: "Provide between 1 and 20 messages." }, { status: 400 });
		}
		if (messages.some((message) => !["system", "user", "assistant"].includes(message?.role) || typeof message.content !== "string" || message.content.length > MAX_MESSAGE_LENGTH)) {
			return NextResponse.json({ error: "Invalid chat message." }, { status: 400 });
		}

		const { data: session, error: sessionError } = await supabase
			.from("sessions")
			.select("id, expires_at")
			.eq("session_token", sessionToken)
			.eq("is_active", true)
			.maybeSingle();
		if (sessionError || !session || new Date(session.expires_at) <= new Date()) {
			return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
		}

		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });

		const completion = await new OpenAI({ apiKey }).chat.completions.create({
			model: "gpt-4o-mini",
			messages,
			temperature: Math.min(Math.max(Number(temperature) || 0.7, 0), 1),
			max_tokens: Math.min(Math.max(Number(maxTokens) || 1000, 1), 4000),
			...(json ? { response_format: { type: "json_object" } } : {}),
		});
		const content = completion.choices[0]?.message?.content;
		if (!content) throw new Error("AI service returned an empty response.");

		return NextResponse.json({ choices: [{ message: { content } }] });
	} catch (error) {
		console.error("AI chat API error:", error);
		return NextResponse.json({ error: "Unable to get an AI response right now." }, { status: 500 });
	}
}
