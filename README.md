# Open Presence — BaselHack 2026

**One business-controlled source of information, presented to people and made actionable for agents.**

Challenge: **Adobe — The Post-Website Business**. Cash prize amount is not established by the supplied brief.

## Challenge context

Local businesses have moved from their own websites to aggregator profiles; increasingly an assistant may discover, compare and book without a person visiting either. How can the business remain accurately represented, discoverable, bookable and in control?

Adobe asks for both:
1. A believable vision of local-business presence in roughly 5–10 years.
2. A running prototype demonstrating a real mechanism.

Judging weighs vision/believability, innovation and execution/craft roughly equally, with additional recognition for an unexpected vision. A working core matters more than a hollow polished interface.

The supplied terms say entrants retain IP, Adobe may showcase submissions with credit under the stated conditions, and the repository should include an OSI-standard licence. An upstream content licence is not a substitute for selecting an appropriate implementation licence.

[Official challenge](https://www.baselhack.ch/challenges/the-post-website-business)

## Current idea

A small hotel maintains one structured source for its identity, offerings and policies. The human page and agent tools consume that state. The owner changes information once and can inspect what is published.

Separate four concerns:
- **Authorship/control:** who published a claim and who can update it?
- **Meaning:** what fields and policies mean.
- **Discovery:** how an agent finds the business and current records.
- **Action:** how an agent obtains an offer and completes a reservation.

A signed owner assertion proves neither that a room is quiet nor that the publisher legally owns the hotel. Represent those boundaries explicitly.

## AT Protocol: ownership and publishing hypothesis

Explore an AT Protocol Lexicon for public, agent-readable business information. AT Protocol offers DID-based identity, signed data repositories and application-defined record schemas. It is a candidate publishing substrate, not a complete business trust system.

Possible experimental record families:

| Record | Purpose |
| --- | --- |
| Business profile | Identity, public description, domain and service references |
| Offering | Described rooms/services and stable offer identities |
| Policy | Explicit terms, effective dates and links to supporting material |
| Service reference | Where to query fresh availability, quotes and booking actions |

Use illustrative record names until we choose a namespace under a domain we control. Do not claim an invented schema is a standard.

Record provenance should preserve the publishing DID, AT URI and the CID observed by a consumer. A correction can change content at the same record URI; retain the version used for a quote. Account control, domain control, real-world business authority and truth of individual claims are different checks.

Keep live inventory, customer information, private negotiations and reservations in an appropriate transactional backend. Publish public information/references, not booking details, to public repositories. Design expiry and withdrawal handling: a consumer's cached claim is not automatically current.

## Interfaces over the same domain operations

| Interface | Intended role |
| --- | --- |
| Human website | Inspect offers and act directly |
| WebMCP | Structured page tools for an agent working in the browser |
| Remote MCP / HTTP | Query/action access without an open business page |
| CLI | Local testing and automation |
| Portable data/assistant bridge | Reviewable interchange where direct integration is unavailable |

WebMCP is experimental. It does not by itself provide global business discovery, prove claims or replace the transaction backend. Select routes according to actual client capabilities.

This follows the shared-engine/adapters design in [msteams-personas](https://github.com/blackmath88/msteams-personas/blob/feat/cli-mcp-render/docs/SLIDES-AS-CODE-CONCEPT.md). Reuse the principle and selected infrastructure, not the M365 scenario model wholesale.

## First working slice

1. Define one fictional Basel hotel, a small inventory and explicit dates/policies.
2. Provide an owner editor and a human-readable view.
3. Expose current offers through a small API and a supported browser-agent tool.
4. Ask for a stay with late check-in and a dog; show supported constraints and unknowns.
5. Change the policy once and demonstrate the changed agent decision.
6. Persist a mock booking; reject stale quotes and unavailable inventory.
7. Let a human inspect and continue the same reservation.

AT Protocol spike: publish/read a minimal public record if a suitable development identity is available; otherwise validate a local candidate schema and label publication as unimplemented. A local JSON object alone does not demonstrate AT Protocol ownership or signature verification. Keep a functioning owner→agent→booking loop independent of the publishing spike.

## Demo and vision

The memorable moment: the owner corrects how the business is represented, the agent detects the current terms and changes its decision, and the human can see why.

For the vision, explain who hosts records, who indexes them, who handles transactions, why an owner adopts this, how corrections propagate and what happens when an agent ignores them. A test directory can demonstrate bounded discovery; it cannot establish open-web adoption.

## Open questions

- Does AT Protocol materially improve portability/control over a conventional domain-hosted business document?
- How is a publisher's authority to represent the real business established or delegated?
- What belongs in a public record versus a live service?
- How do consumers handle stale records, conflicting observations and revoked claims?
- Which browser/client can demonstrate actual WebMCP?
- Which two access routes best demonstrate the shared mechanism this weekend?

Out of initial scope: universal trust protocol, global index, real payments and production booking-platform integrations.

## Technical reference points

- [AT Protocol overview](https://atproto.com/guides/overview)
- [Data repositories](https://atproto.com/guides/data-repos)
- [Lexicon specification](https://atproto.com/specs/lexicon)
- [Identity](https://atproto.com/guides/identity)
- [WebMCP overview](https://developer.chrome.com/docs/ai/webmcp)
- [WebMCP draft](https://webmachinelearning.github.io/webmcp/)

These support exploration of protocol mechanics; they do not endorse this application or prove business claims.

## How we work

This is a solo BaselHack 2026 exploration, prepared on **30 October 2026**. Start with one observable mechanism, test the uncertain assumption early, and make the integrated demo work before widening the scope.

- Keep facts, assumptions, model proposals and human decisions distinguishable.
- Reuse existing work explicitly; record source commits and licences before copying code or assets.
- Keep each entry independently runnable. Do not build a common platform as a prerequisite.
- Record experiments as: question → evidence → observation → decision → remaining uncertainty.
- Use fictional demo data where applicable. Do not publish credentials or private conversations.
- These briefs do not establish eligibility, acceptance, multiple-entry permission or prize entitlement. Confirm event rules, including prior-work reuse.
- No runtime, stack, AI provider, hosting or deployment is selected by this README.

## Related BaselHack explorations

- [Paratext](https://github.com/blackmath88/baselhack26-paratext) — inspect a conversation at different resolutions.
- [RackRadar](https://github.com/blackmath88/baselhack26-rackradar) — turn rack occupancy into useful guidance.
- [Life Conductor](https://github.com/blackmath88/baselhack26-life-conductor) — connect life scenarios, explanations and advisory handoffs.
- [Open Presence](https://github.com/blackmath88/baselhack26-open-presence) — business-controlled information for people and agents.

## Status and next session

**Documentation foundation only. No runnable implementation or validated results in this repository yet.** Add observations and implementation evidence as the project develops. Begin the next session by reading this README and inspecting the current tree; proposed mechanisms below are hypotheses, not completed features.

Licence for newly authored implementation: choose explicitly before importing or releasing code. MIT is a candidate; upstream licences and attribution must be retained.
