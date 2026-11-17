# Live response review

These are manual Gemini checks, separate from the deterministic regression tests.
Run against current published Sanity content. Never save responses as runtime fallbacks.

| Question | Review |
| --- | --- |
| How has Joe connected physical operations to web software? | Relevant supplier/logistics evidence; no invented dates, metrics, or employers. |
| How does Joe build grounded AI systems? | Current portfolio architecture and AI engineering evidence; metadata agrees with Sanity. |
| What makes Joe a product engineer? | A concise synthesis backed by the strongest available projects or achievements. |
| What has Joe built with Rust? | When unsupported by current content, acknowledge the gap and return zero receipts. Do not infer experience from the technology catalog. |
| Can I download Joe’s resume? | Live published download links; no unrelated receipt dump. |
| Show full overview | Explicit overview tool, without changing ordinary questions into a career timeline. |

For evidence questions: prose first, zero to three ranked receipts, clear type metadata,
third-person vignettes, three relevant follow-ups, and no repeated summary or closing filler.
Ask another complete question afterward to check retained conversational context.

Also test Stop, a disconnected request, and retry: partial live output stays readable,
controls recover, and retry sends a fresh request. No cached or canned answer should appear.
