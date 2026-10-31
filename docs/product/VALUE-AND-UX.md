# Value and UX — find, judge, contribute

31 October 2026

**Status:** Achim explicitly agreed the value framing and three use cases in the project conversation. The interface wording, layout and demonstration requirements below are implementation proposals. This document does not claim a working interface or measured benefits.

## The promise

**Find experience that fits your situation. Understand its limits. Leave something useful for the next person.**

We help people judge whether someone else's experience applies to their situation, and make their own discoveries available to others.

Intended value: less repeated investigation and more usable shared experience. This is a benefit to test, not a measured result.

## The problem

Finding and judging: relevant answers can hide different circumstances, failed attempts or later corrections. People reconstruct whether advice applies before deciding what to do.

Giving back: discoveries made during private AI-assisted work are costly to turn into public contributions. Useful observations remain in private chats.

These problems are not specific to repositories. A software workaround, a device repair or a discussion about a working method can all depend on circumstances and subsequent corrections. The photo-frame corpus is our bounded demonstration case, not the definition of the product.

## Three use cases and the value each must show

| Use case | Friction today | Delivered value to demonstrate | Visible UX evidence |
| --- | --- | --- | --- |
| Has someone encountered my situation? | Broad answers make recognition and applicability hard. | Reach a relevant starting point with less reconstruction. | Original account, circumstances, reason for matching and a visible difference/near-match. |
| Does this advice still apply? | Differences, disagreement and later corrections disappear inside one answer. | Choose a next step with an understanding of limitations and unknowns. | Compare conditions, follow a correction over time and reach the original evidence. |
| We learned something others could use. | Sharing a discovery feels like another writing task. | Turn a selected observation into a small, reusable contribution. | Preserve the person's words, preview exactly what is shared, connect it to what it qualifies and show its actual visibility. |

## Make the value visible

### Entry

Suggested headline: **Find experience that fits your situation.**

Suggested explanation: “See what people tried, under which conditions, and what changed afterwards. Add what you learned.”

Primary prompt: **What are you trying to do, and what happened?**

Do not require a repository URL or technical vocabulary to begin. Where the pilot is limited, show its actual coverage: “This pilot searches photo-frame experiences from one captured community.” Do not imply general-web search.

### Results: recognition before synthesis

Each result should answer:

- What happened, in the contributor's own words where available?
- Under which conditions?
- Why did this match my question?
- What differs from my situation, or remains unknown?

Suggested actions: **Inspect experience** and **Compare accounts**.

Show author, date, source and interpretation status. Keep writer-added search aliases distinct from source wording. Do not present ranking as certainty or a universal fix.

### Inspector: judgement and change

Suggested sections: **What was tried**, **Reported outcome**, **Conditions**, **What changed later**, **Still unknown**.

Keep a quotation separate from our interpretation. Let people reach original context or explicitly see that it was not captured. A timeline can reveal a later correction; a graph can reveal a connection. Both must help answer a concrete question and expose their sources and origins.

Suggested comparison columns: conditions, attempted steps, reported outcome and limitations. Empty fields read **Unknown**, never inferred compatibility.

The person should be able to state: “I will try this because …; this other account differs because …; I still need to check …”.

### Contribution: a small observation is enough

Suggested action: **Add what you learned**.

Start with free text. Offer optional prompts for circumstances and the account being qualified; do not require a polished article or rigid evidence form.

Show the exact selected content, its attribution, proposed connection and destination before sharing. Do not automatically import the private chat.

For the first local version:

- Say **Save local draft**.
- Show **Only on this browser · Unreviewed**, if browser storage is actually the implementation.
- Explain that other people cannot discover it.
- Preserve it across reload, support removal, and expose storage failures.
- Show saved drafts separately or clearly labelled when included in local search.

Do not call local storage community publication. Shared publishing and another person's rediscovery are later capabilities unless implemented and explicitly exercised.

## Demonstration: show the benefit, not just the controls

1. A person enters a problem in everyday language.
2. They recognise a relevant account and explain one matching circumstance.
3. They inspect a near-match and explain why it may not apply.
4. They discover a correction or different reported outcome and adjust their intended next step.
5. They save one short observation and find it again, visibly local-only.

A completed local demo demonstrates discovery, judgement and contribution preparation. Community value requires an additional loop: another person actually discovers and can use a deliberately shared contribution. If absent, state that boundary in the demo.

Use real source material for evidence. Any illustrative contribution must be labelled as a demo/local draft, never presented as activity from a real source author.

## What to test with a person

Ask them to find an applicable account, explain a mismatch, identify a correction and one remaining unknown, and draft a useful follow-up.

Record where they hesitate, what they misunderstand and whether original sources help their decision. Compare with ordinary source navigation where practical. A small trial is exploratory evidence; do not claim general time savings or community impact from a successful walkthrough.

## Scope and handoff

Agreed: the value framing and three use cases.
Proposed: interface copy, comparison layout and demonstration requirements above.
Open: shared publication/rediscovery mechanism and evidence of benefit.
Unchanged: bounded photo-frame pilot, optional Adobe narrative, and independent Knowledge Lab exploration.
Affected documents: this brief, README and current concept.
Sources: deliberately selected agreement from this project conversation; [current concept](../../HUMAN-SIGNAL-CONCEPT.md), [plan](../../HACKATHON-PLAN.md), [architecture proposal](../architecture/PROPOSED-SHARED-MEMORY.md).

No architecture proposal is accepted by this UX clarification.
