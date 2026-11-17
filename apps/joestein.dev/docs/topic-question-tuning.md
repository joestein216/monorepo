# Suggested-question tuning report

November 17, 2026. Original tuning report retained below for comparison.

Current direction: starter prompts are edited and ordered in Sanity under About → Starter questions. Their generation, navigation caching, and synthesized fallback menus have been removed. Contextual prompts remain generated from the selected question, its summary, and supporting evidence. Both origins render as first-class prompts in one flat list; contextual items retain origin IDs and labels rather than forming a nested hierarchy.

Implementation update: buttons now use one short question for display and submission. Follow-up generation is anchored to the actual current question, its just-written summary, and supporting evidence. Per Joe’s subsequent direction, there are no topic-duplicate instructions or semantic uniqueness checks, and no Level 1 question list is sent to the model. No additional model calls were added. The duplicate-exclusion proposals below were not adopted. Sanity schemas and published content are unchanged.

## Recommended interaction

Use the actual short question as both the visible button text and the submitted prompt. Remove the distinction between a topic label and a longer hidden question.

Keep eight Level 1 starting questions for now. They need not cover the entire portfolio. Each should open one subject, without packing several subjects or instructions into a question. Level 2 should offer three narrower questions inside the selected subject, using the returned Level 1 summary and its supporting evidence to identify meaningful details worth exploring. The summary is an anchor, not permission to wander into adjacent subjects elsewhere in the portfolio.

A useful starting target is 5–10 words and no more than 65 characters per question. Treat these as tuning targets pending review, not an instruction to clip generated text.

## What the current code does

- Clicking a primary button submits its `topic.prompt` verbatim as a user message. The selected question reaches Gemini.
- The UI records that user turn's ID and only replaces the selected primary slot with follow-ups from its response. It does not accidentally display a previous turn's suggestions.
- The server receives conversation text, but not the selected topic ID or the complete set of visible Level 1 questions. It cannot explicitly exclude those questions when generating children.
- Both the system prompt and tool description frame suggestions around the current **thread**, and the system prompt invites **adjacent details**. Neither requires children to stay strictly beneath the selected Level 1 question.
- Initial topic generation still asks for full career coverage and combining related evidence into chapters. The fallback prompts also bundle problems, implementation, and trade-offs. Those instructions encourage the dense questions we now want to avoid.

These are instruction/context gaps. The inspected code does not indicate a turn-association bug. The particular unrelated suggestions observed in the browser were not captured, so their exact generation could not be replayed.

## Use the returned summary as an anchor

The user proposed grounding Level 2 in the actual Level 1 response summary. This fits the existing summary-first generation: Gemini has its own preceding prose available when it writes tool arguments. The current instructions do not explicitly require it to use that summary.

Proposed generation priority:

1. The selected Level 1 question defines the subject boundary.
2. The summary just written and the evidence selected for that answer identify the concrete details to explore next.
3. Published Sanity content determines what can actually be answered.
4. The other Level 1 questions exclude duplicate or neighboring subjects.

For example, a coding-agents summary mentioning scoped Codex work, persistent guardrails, and human diff review naturally supports children about those three mechanisms. If the summary briefly mentions Sanity too, that does not justify repeating the separate content-modeling Level 1 question.

Ask for deeper detail beyond what the summary already explained; do not just rephrase its answer as a question. This can happen in the existing generation. A separate “generate children from the completed summary” request would add latency and cost and is not necessary for the initial implementation.

## Proposed Level 1 questions

This is an editorial seed set for review, not a hardcoded production menu or an exhaustive content map:

1. How does Joe use coding agents?
2. How does Joe keep AI grounded?
3. What has Joe built for suppliers?
4. How does Joe handle payments?
5. How does Joe improve performance?
6. What has Joe built for artists?
7. How does Joe model content?
8. How does Joe approach product work?

There is some shared evidence across these subjects. That is fine: questions should be distinct, while relevant receipts may recur under different questions.

## Four proposed scenarios

**Editorial examples, grounded in the published Sanity content; these rows are not successful Gemini batch outputs.** Every cell is the complete button text and complete submitted question.

| Selected Level 1 question | Level 2 question 1 | Level 2 question 2 | Level 2 question 3 |
| --- | --- | --- | --- |
| How does Joe use coding agents? | How does Joe scope work for Codex? | How does AGENTS.md guide Joe’s coding agents? | How does Joe review agent-written code? |
| How does Joe keep AI grounded? | How does Joe validate receipt IDs? | Where does Joe hydrate receipt metadata? | How does Joe rank supporting evidence? |
| What has Joe built for suppliers? | How did SupplierNet replace fax workflows? | How did SupplierNet track physical samples? | How did SupplierNet manage supplier access? |
| How does Joe handle payments? | How did Joe integrate Stripe hardware? | How did Joe handle Clover network interruptions? | How did Joe trace payment transactions? |

Supporting content:

- Coding agents: the `ai` achievement and joestein.dev's agentic-workflow architecture notes document scoped specifications, persistent guardrails, and human diff review.
- Grounded AI: the `ai` achievement and joestein.dev's runtime notes document ID validation, server metadata hydration, and rejection of invalid pointers. The same notes document shared relevance scoring across projects and achievements.
- Suppliers: `estee-lauder-suppliernet-portal`, `estee-lauder-suppliernet-sample-qa`, and `estee-lauder-suppliernet-sap-identity` support the three distinct workflows.
- Payments: `payments` and `clover` support Stripe integration, Clover interruption recovery, and transaction tracing.

Examples to reject under **coding agents**:

- “How does Joe model Sanity content?” — repeats the content-modeling Level 1 subject.
- “How does Joe keep AI grounded?” — directly repeats another Level 1 question.
- “What else has Joe built?” — moves away from the parent instead of going deeper.
- “How does that work?” — too dependent on an implicit reference.

## Live probe results

Used the configured `gemini-3.5-flash-lite`, Vercel AI SDK, and freshly read published Sanity data. Probes ran outside the application, without changing its prompt, tools, or UI. The candidate probes used structured output for question inspection rather than the full streaming UI flow. This is a prompt-tuning exercise, not an end-to-end verification.

Several generation attempts returned Google's HTTP 503 high-demand error. The four-scenario batch therefore **remains unverified live**. A final probe explicitly generating each Level 1 summary before its children also returned HTTP 503, so the summary-anchored variant has not yet been validated against Gemini. A current-instructions baseline also yielded no summary or completed follow-up output in the recorded result, so it provides no usable before/after question comparison.

One candidate probe completed with a synthetic earlier payments exchange and the newly selected parent **“How does Joe use coding agents?”**. The prompt included all eight Level 1 questions, required narrower children, and prohibited duplicates. Gemini returned:

| Actual generated child | Review |
| --- | --- |
| How does Joe use OpenAI Codex for specs? | On subject, but ambiguous: the content says Joe delegates scoped specifications to Codex, not that Codex necessarily authors his specifications. Prefer “How does Joe scope work for Codex?” |
| How does Joe configure AGENTS.md guardrails? | On subject. Prefer asking how guardrails guide agents; the content does not enumerate an exact configuration. |
| How does Joe use Sanity MCP for content modeling? | Reject: duplicates the separate Level 1 content-modeling subject instead of going deeper into coding-agent collaboration. |

All three pointed to the existing `ai` achievement. None drifted back to payments. That is one encouraging sample for parent anchoring, but it also demonstrates that semantic non-duplication needs more tuning; it is not guaranteed by adding one instruction.

## Implementation direction after review

1. Generate one short `question` per button rather than separate label/prompt text. Update both generated navigation and deterministic navigation fallback together.
2. Supply the selected parent question and all visible Level 1 questions as navigation context on primary-topic requests. Portfolio facts still come exclusively from fresh server-side Sanity data. Navigation context must never override grounding rules.
3. Replace “adjacent details” with a narrower-child rule: each child explores one documented mechanism, decision, or outcome raised by the just-written summary and its supporting evidence, staying beneath the selected parent. Reject a candidate that belongs more naturally under another Level 1 question.
4. Check exact normalized duplicates against Level 1 and siblings cheaply. Continue reviewing semantic duplicates through live samples; string checks cannot detect paraphrases.
5. Generate follow-ups within the existing answer/tool call. No additional per-turn model call is required by this proposal. Preserve the existing two-tier navigation behavior.

Before accepting the tuning, rerun the four scenarios individually and the payments-to-agents switch. Check brevity, evidence support, independence from hidden wording, parent specificity, and semantic duplication against every Level 1 question. Do not replace questions with canned answers or cache conversational responses.
