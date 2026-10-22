export function requestAiChat(payload) {
	const sessionToken = window.localStorage.getItem("session_token");
	return fetch("/api/ai-chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...payload, sessionToken }),
	});
}
