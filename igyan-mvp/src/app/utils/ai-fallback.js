/**
 * Unified AI chat-completion helper with automatic OpenAI -> Gemini fallback.
 *
 * Tries OpenAI first. If OpenAI fails (network/HTTP error) OR returns an
 * empty/bad response, it automatically retries the SAME request against
 * Gemini via its OpenAI-compatible endpoint. Once OpenAI starts working
 * again, calls go back to OpenAI on their own (OpenAI is always tried first).
 *
 * Returns an OpenAI-shaped response object, so existing call sites can keep
 * reading `data.choices[0].message.content` unchanged. A `_provider` field
 * ("openai" | "gemini") is added for visibility.
 *
 * Usage (drop-in for `openai.chat.completions.create(params)` and for the raw
 * `fetch("https://api.openai.com/v1/chat/completions", ...)` pattern):
 *
 *   import { aiChat } from "@/app/utils/ai-fallback";
 *   const data = await aiChat({ model: "gpt-4o", messages, temperature: 0.7 });
 *   const text = data.choices[0].message.content;
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
// Gemini's OpenAI-compatible Chat Completions endpoint (same body/response shape)
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-flash-latest";

function resolveKeys(options) {
  return {
    openaiKey:
      options?.openaiApiKey ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY,
    geminiKey:
      options?.geminiApiKey ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY,
  };
}

/** A response is "bad" when there is no usable assistant content. */
function isBadResponse(data) {
  const content = data?.choices?.[0]?.message?.content;
  return !content || (typeof content === "string" && content.trim() === "");
}

async function callProvider(url, key, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }
  return res.json();
}

/** Only forward params Gemini's OpenAI-compat layer reliably accepts. */
function toGeminiBody(params) {
  const body = { model: GEMINI_MODEL, messages: params.messages };
  if (params.temperature != null) body.temperature = params.temperature;
  if (params.max_tokens != null) body.max_tokens = params.max_tokens;
  if (params.top_p != null) body.top_p = params.top_p;
  if (params.response_format) body.response_format = params.response_format;
  return body;
}

/**
 * @param {object} params  OpenAI chat.completions params ({ model, messages, ... })
 * @param {object} [options] { openaiApiKey, geminiApiKey } overrides
 * @returns {Promise<object>} OpenAI-shaped response with extra `_provider`
 */
export async function aiChat(params, options) {
  const { openaiKey, geminiKey } = resolveKeys(options);

  // 1) Primary: OpenAI
  if (openaiKey) {
    try {
      const data = await callProvider(OPENAI_URL, openaiKey, params);
      if (!isBadResponse(data)) {
        data._provider = "openai";
        return data;
      }
      console.warn("[aiChat] OpenAI returned an empty/bad response — falling back to Gemini");
    } catch (err) {
      console.warn("[aiChat] OpenAI request failed — falling back to Gemini:", err?.message || err);
    }
  } else {
    console.warn("[aiChat] No OpenAI key configured — using Gemini directly");
  }

  // 2) Fallback: Gemini (OpenAI-compatible)
  if (!geminiKey) {
    throw new Error("AI request failed: OpenAI unavailable and no Gemini fallback key configured");
  }
  const data = await callProvider(GEMINI_URL, geminiKey, toGeminiBody(params));
  data._provider = "gemini";
  return data;
}

/**
 * Drop-in replacement for the raw
 *   fetch("https://api.openai.com/v1/chat/completions", { method, headers, body })
 * pattern. Keeps the same call signature so the only change at a call site is
 * `fetch(` -> `aiFetch(`. The url/method/headers are ignored; the JSON body is
 * parsed and run through aiChat (OpenAI -> Gemini fallback). Returns a minimal
 * Response-like object so existing `response.ok` / `response.json()` code works.
 */
export async function aiFetch(_url, opts = {}, options) {
  let params = {};
  try {
    params = opts.body ? JSON.parse(opts.body) : {};
  } catch {
    params = {};
  }
  try {
    const data = await aiChat(params, options);
    return {
      ok: true,
      status: 200,
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  } catch (err) {
    const message = err?.message || "AI request failed";
    return {
      ok: false,
      status: 502,
      statusText: "AI Error",
      json: async () => ({ error: { message } }),
      text: async () => message,
    };
  }
}
