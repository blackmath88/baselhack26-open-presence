# Perplexity research and idea-sparring prompt — Open Presence

Prepared 30 October 2026. Copy the prompt below into Perplexity. It is self-contained; repository access improves grounding but must be verified. This file is an instruction brief, not completed research.

---

Act as a critical research partner and practical hackathon sparring partner. Help a solo interdisciplinary builder sharpen an idea and choose a small, convincing experiment. Do not sell our initial idea back to us or generate a sprawling startup plan.

## Repository and current intent

Target repository: https://github.com/blackmath88/baselhack26-open-presence
Read its current README and any relevant existing research first. Preserve newer decisions if they differ from this preparation brief. If inaccessible, say so and use the context below; never imply you inspected unread code.

Challenge: Adobe “The Post-Website Business”. Required: a credible 5–10-year vision plus a working mechanism for a local business to control its representation and support agent discovery/actions. Cash prize is unconfirmed. Sponsor requests an OSI licence.
Our idea: one owner-maintained business state, read by humans and exposed through MCP/HTTP and WebMCP. Explore AT Protocol identity/signed repositories/Lexicon as a portable public publishing layer for agent-readable information. Keep discovery, provenance, claims, transaction rules and interface adapters distinct.
Reference https://github.com/blackmath88/msteams-personas/tree/feat/cli-mcp-render for shared domain operations/adapters; its M365 content model is not the business model.
Start with one fictional Basel hotel. Owner correction changes agent interpretation and a real mock reservation state transition. AT Protocol is a hypothesis to test, not a predetermined requirement.

Preferred demo: An owner corrects a hotel policy; human and agent views reflect the current version, the agent changes its decision, and a mock booking rejects stale terms. A separately labelled spike tests public record publishing/provenance.

We favour visual, understandable mechanisms, inspectable evidence and early tests that can disprove the premise. We are preparing multiple independent entries: minimise new infrastructure and integration work. There is no fixed stack or provider yet. Separate existing implementation, proposed reuse and genuinely new work.

## Research and sparring tasks

- Pressure-test the AT Protocol idea against domain-hosted JSON/JSON-LD plus Schema.org, conventional APIs/MCP and other genuinely relevant approaches. Where is AT Protocol useful, unnecessary or actively inconvenient?
- Inspect current primary AT Protocol documentation: DIDs, domain handles, repository commits/signatures, record updates/URIs/CIDs, Lexicon validation, schema namespace ownership, indexing and migration. Separate protocol guarantees from app responsibilities.
- Distinguish control of an account, control of a domain, authority to represent a real business, provenance of a claim and truth of a claim. What could the prototype actually verify?
- Sketch candidate profile/offering/policy/service-reference Lexicons using a clearly illustrative namespace. Separate stable public claims from live availability and private reservations. Do not publish a namespace we do not control or create accounts.
- How do freshness, effective dates, conflicting claims, withdrawal and stale index results work? A persistent URI alone is not a historic version archive.
- Research WebMCP's current official specification/browser support and actual agent-client capabilities. Distinguish in-page tools from remote MCP; do not promise universal interoperability.
- Does the browser route contribute more than an adapter? Demonstrate human/agent shared state and a useful handoff.
- How does a nontechnical owner publish once, inspect representation and correct it? Who hosts/indexes it, and what incentive supports adoption?
- What prevents a booking based on stale policy or inventory? Specify quote versioning, confirmation, idempotency and concurrent inventory checks for a tiny mock service.
- Compare three product framings and identify one surprising but credible alternative. Avoid inventing a global discovery/trust network for the weekend.
- Design an explicit experiment that can reject AT Protocol in favour of a simpler publishing layer, without losing the owner-control idea.

Begin with the strongest objection to our direction and the most valuable unresolved question. Investigate before selecting a solution. Give us choices that differ in their mechanism, not just their branding. Do not automatically choose the most technologically elaborate one.

## Evidence requirements

Research as of the date you execute this prompt. State that date and distinguish it from this brief's preparation date.
- Prefer primary sources: official challenge pages, protocol specifications, official domain documentation, original papers and inspected repositories.
- For technical claims, use primary sources. For current legal/financial rules, use official sources and flag unresolved interpretation.
- Use secondary sources for discovery or perspective, labelled accordingly.
- Cite material claims with clickable source URLs near the claim. Record title, publisher/author, publication/update date where available, access date and what the source supports.
- Do not fabricate citations, accessible APIs, browser support, account access, benchmark results or code verification.
- Distinguish observed facts, inferences, hypotheses and unknowns. Small exploratory tests do not establish general effectiveness.
- Use a focused source set (roughly 8–12 strong sources where available); do not pad the report to meet a count.
- If challenge text or resources cannot be verified online, attribute them to the supplied brief and identify mentor questions.

## Required deliverable

Write a concise but substantive Markdown research memo, approximately 1,200–1,800 words excluding sources, with:
1. Recommendation and strongest counterargument.
2. What is already known, what we misunderstood, and what remains uncertain.
3. Three contrasting concepts, compared by usefulness, novelty, new effort, dependencies and failure modes. Time estimates are rough assumptions, not guarantees.
4. Existing-work/reuse map with exact inspected file or document links and licence caveats.
5. Recommended smallest working slice: input, state, operation, visible result and what must genuinely execute.
6. First 60–90-minute experiment with materials, observation method, success criteria and a stop/pivot rule.
7. A short demo storyboard and a challenge-requirement coverage table; mark any unmet requirement.
8. Open questions ranked by whether they block the first experiment.
9. Source table and evidence limitations.

Include relevant schema sketches or interaction examples only when they clarify the mechanism. Do not implement the product or select paid services.

## Write the findings directly into the repository

The user requests the research findings be written into this exact repository. This does not imply that this Perplexity session has GitHub tools or credentials.

Before promising a commit, establish whether your available tools actually provide authenticated write access to blackmath88/baselhack26-open-presence. Public browsing or a read-only GitHub connector does not count. Never request tokens in chat or invent a repository-write capability.

If authenticated writing is available:
- Read the destination if it exists; preserve human additions and newer decisions.
- Write the memo to `docs/research/PERPLEXITY-RESEARCH.md` in **blackmath88/baselhack26-open-presence only**.
- Commit with message `docs: add Open Presence research and idea sparring`, using the normal supported repository workflow. If direct default-branch writes are blocked, create a research branch and a pull request if your tools support that.
- Do not edit the README, implementation, licences or other repositories. Do not merge a PR, deploy, provision services, buy anything or grant permissions.
- Verify the saved content and return the actual file link, commit SHA and, if applicable, PR URL. A local draft or generated link is not proof of a push.

If authenticated writing is unavailable:
- Say plainly that no repository changes were made.
- Return the complete memo as one Markdown file/attachment, or one Markdown code block if attachments are unavailable.
- Label it with its intended destination: `blackmath88/baselhack26-open-presence/docs/research/PERPLEXITY-RESEARCH.md`.
- This fallback lets the user bring the exact result back to the already connected coding assistant for committing. Do not claim that a prompt, public repo URL or GitHub reading permission grants write access.

Do the research now rather than merely returning a research plan.
