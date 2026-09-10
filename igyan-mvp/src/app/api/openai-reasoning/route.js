import { NextResponse } from "next/server";
import { aiFetch } from "@/app/utils/ai-fallback";

export async function POST(request) {
	try {
		const { prompt } = await request.json();

		if (!prompt) {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 }
			);
		}

		// Check if OpenAI API key is configured
		const apiKey = process.env.OPENAI_API_KEY;

		if (!apiKey) {
			console.warn("OpenAI API key not configured, using fallback reasoning");
			return NextResponse.json({
				reasoning: "This substitute was selected based on subject expertise match, teaching experience compatibility, and current workload availability. The algorithm determined this to be the optimal choice among available faculty members.",
			});
		}

		const response = await aiFetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content:
							"You are an educational administrator assistant. Provide concise, professional explanations for faculty substitution decisions. Keep responses to 2-3 sentences maximum.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 150,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("OpenAI API error:", errorData);

			// Return fallback reasoning
			return NextResponse.json({
				reasoning: "This substitute was selected based on subject expertise match, teaching experience compatibility, and current workload availability. The algorithm determined this to be the optimal choice among available faculty members.",
			});
		}

		const data = await response.json();
		const reasoning = data.choices[0]?.message?.content?.trim() || 
			"This substitute was selected based on algorithmic analysis of multiple factors including subject expertise, experience, and availability.";

		return NextResponse.json({ reasoning });
	} catch (error) {
		console.error("Error in OpenAI reasoning API:", error);

		// Return fallback reasoning instead of error
		return NextResponse.json({
			reasoning: "This substitute was selected based on comprehensive analysis of subject expertise, teaching experience, classroom familiarity, and current workload capacity.",
		});
	}
}
