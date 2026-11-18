# Gemini fallback compatibility check

Checked November 18, 2026 using the API credential loaded from this app’s local environment. No visitor questions or credentials were logged. These results do not verify that Vercel uses the same credential.

All four requested IDs appeared in the account’s Google model listing. Actual requests used the installed Google provider and AI SDK, streaming, `thinkingLevel: "low"`, `maxRetries: 0`, `maxOutputTokens: 3000`, and a forced `showReceipts` function with the portfolio receipt input shape. The probe used synthetic content, not visitor data.

| Model | Actual streaming/tool execution | Observation |
| --- | --- | --- |
| `gemini-3.5-flash-lite` | Passed | One executed tool result, about 1.2 seconds. |
| `gemini-3.1-flash-lite` | Passed | One executed tool result, about 14.6 seconds. |
| `gemini-3.8-flash` | Passed on recheck | Initial 20-second probe timed out; recheck completed in about 6.2 seconds. |
| `gemini-3.6-flash` | Not verified | Both attempts returned HTTP 503 with Google’s temporary high-demand message. |

The checks found no explicit plan/access rejection, but being listed does not prove successful generation. The `3.6-flash` result remains a capacity-blocked compatibility check. Successful probes also do not guarantee later capacity, quota independence, or access with a different deployment credential.

The application retains the requested order. It advances only for pre-output 429/quota/rate-limit errors. It intentionally does not treat 503, permission errors, invalid settings, or failures after answer/tool output starts as quota fallback. All attempts and the existing bounded completion step share the same 50-second abort signal. Quota fallback uses zero SDK retries per model.
