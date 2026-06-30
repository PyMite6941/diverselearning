// Free-model AI provider chain with failover: Groq -> OpenRouter.
// Mirrors the pattern used across the workspace (tin.studio, Fitness AI).
// Forces ":free" OpenRouter models unless OPENROUTER_ALLOW_PAID=true so the
// key is never billed by accident.

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

interface Provider {
  name: string;
  url: string;
  key: string | undefined;
  models: string[];
}

function freeize(model: string): string {
  if (process.env.OPENROUTER_ALLOW_PAID === "true") return model;
  return model.endsWith(":free") ? model : `${model}:free`;
}

function providers(): Provider[] {
  return [
    {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      // 120b is reliable at filling every lesson/model; with reasoning_effort
      // "low" it's still fast on Groq. 20b is the fallback.
      models: ["openai/gpt-oss-120b", "openai/gpt-oss-20b"],
    },
    {
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      models: [
        freeize("meta-llama/llama-3.3-70b-instruct"),
        freeize("google/gemini-2.0-flash-exp"),
        freeize("qwen/qwen-2.5-72b-instruct"),
      ],
    },
  ];
}

export function hasAnyProvider(): boolean {
  return providers().some((p) => p.key);
}

/**
 * Run a chat completion against the first provider/model that succeeds.
 * Returns the assistant message content (string). Throws if all fail.
 */
export async function chat(
  messages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const errors: string[] = [];

  for (const p of providers()) {
    if (!p.key) continue;
    for (const model of p.models) {
      try {
        const res = await fetch(p.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${p.key}`,
            ...(p.name === "openrouter"
              ? { "HTTP-Referer": "https://diverselearning.app", "X-Title": "DiverseLearning" }
              : {}),
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: opts.temperature ?? 0.7,
            ...(opts.json ? { response_format: { type: "json_object" } } : {}),
            // gpt-oss are reasoning models — low effort keeps generations snappy
            // (they still produce solid structured JSON).
            ...(p.name === "groq" ? { reasoning_effort: "low" } : {}),
            ...(opts.maxTokens ? { max_tokens: opts.maxTokens } : {}),
          }),
        });

        if (!res.ok) {
          errors.push(`${p.name}/${model}: ${res.status}`);
          continue;
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content as string;
        errors.push(`${p.name}/${model}: empty response`);
      } catch (e) {
        errors.push(`${p.name}/${model}: ${(e as Error).message}`);
      }
    }
  }

  throw new Error(`All providers failed: ${errors.join("; ")}`);
}
