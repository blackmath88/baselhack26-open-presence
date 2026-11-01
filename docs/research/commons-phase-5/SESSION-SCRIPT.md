# Commons Phase 5: observed session script

Prepared 1 November 2026 by Claude (assistant, `kind: assistant`). **Not yet run with anyone.** Nothing in this folder
is evidence of benefit until sessions have happened and their notes are summarised.

Plan: Phase 5 of [COMMONS-EXPERIENCE-BUILD-PLAN.md](../../build/COMMONS-EXPERIENCE-BUILD-PLAN.md). It asks where people
hesitate, and whether they can:
1. explain whether an account applies to them, and how it does not;
2. tell the source author's words from the record writer's reading;
3. name something the Commons does not know;
4. reach the original context;
5. predict what is shared when they contribute, and with whom.

The ordinary GitHub issue list is the simpler comparison view. These are exploratory sessions: five to eight people show
where the design fails. They do not establish that it works better.

## Kit
| File | Use |
| --- | --- |
| This script | Read it aloud where it says **Say**. |
| [observation-sheet.html](observation-sheet.html) | Open locally in a browser during the session. It saves in that browser only, and exports JSON and Markdown. |
| [SUMMARY-TEMPLATE.md](SUMMARY-TEMPLATE.md) | After all sessions: what to aggregate and how to report it. |
| `apps/commons/scripts/research/session.sh P<n>` | Starts an empty room on 127.0.0.1:5221 (API on 8821) in a temporary folder outside the repository. |

## Who and how many
- 5 to 8 people who own, or could plausibly own, a photo frame or similar device. Mix people who use GitHub issues
  regularly and people who never do.
- 45 minutes each. One facilitator, ideally one note-taker.
- Alternate the order of conditions: odd codes do **Commons first**, even codes do **GitHub first**. The sheet sets
  this from the code.

## Privacy and consent (before anything else)
- Use participant codes (`P1`, `P2`…) everywhere. The session script refuses anything else. Never write a name on the
  sheet.
- **Say:** "We are testing the tool, not you. There are no wrong answers. Please think aloud. You can stop at any time.
  I will take written notes. I will record the screen only if you say yes now. Anything you write into the tool stays in
  a temporary room on this laptop, and I delete it afterwards unless you tell me to keep it."
- Record the screen and audio only on an explicit yes, and mark it on the sheet.
- Raw sheets, exports and recordings stay **outside this public repository**. Only the anonymised summary (built from
  [SUMMARY-TEMPLATE.md](SUMMARY-TEMPLATE.md)) may be committed.

## Setup (5 minutes before)
1. `cd apps/commons && npm install` once, then `bash scripts/research/session.sh P<n>`.
2. Open the printed Commons URL in a **fresh private window**. Choose Voice **Mara** (the participant's voice).
3. Open the GitHub issue list in a second private window. Do not sign in.
4. Open `observation-sheet.html`, enter the code, and check the condition order it shows.
5. Keep a second window ready with Voice **Kai** for task C5.

## The situation (read before both conditions)
**Say:** "Imagine you have a PF1007L photo frame. You plugged it into your Mac with a USB-C cable to back it up, and the
Mac does not show the frame at all. You want to know what to try next, and whether other people's experience applies
to you."

Hand over a card with that text. Do not suggest search words.

## Condition G: GitHub issue list (about 10 minutes)
Start at `https://github.com/wesbos/photo-frame-dashboard/issues`.

| # | Task (say it) | Observe |
| --- | --- | --- |
| G1 | "Find something that may explain your situation." | Search words used, time to the first issue they judge relevant, dead ends. |
| G2 | "Does it apply to you? What might be different?" | Can they name a condition that differs, or something unknown? |
| G3 | "Who said that, and is it a person reporting, or someone summarising?" | Do they separate the author from later readers? |

Stop at 10 minutes even if unfinished. Note where they stopped.

## Condition C: the Commons (about 25 minutes)
| # | Task (say it) | What a full answer contains (for the observer only; do not hint) |
| --- | --- | --- |
| C1 **Find** | "Find something that may explain your situation." | Types their own words. The top result for "My Mac cannot see my frame" is *The frame shows no USB data, or no power, on the computer*. Watch whether they read "Why it matched" (words found, words added by the search, words not found). |
| C2 **Judge** | "Does this apply to you? What might be different?" | Uses the record's *Applies to* / *When* / *Symptoms*, the "What may differ" and "Not known here" parts, or a near-match warning. Any honest "I can't tell because…" counts. |
| C3 **Voices** | Point at passage e3 ("Update: it was the cable."). "Who wrote this sentence? And who wrote the grey box under it?" | e3 is by **@jethrojones** (source author). The box is the **agent record writer**, not reviewed by a person. |
| C4 **Original** | "Show me where this was originally said." | Follows *original* to GitHub comment 6113789229, or uses *How this reached you* → *Original source*. |
| C5 **Unknown** | "Is there anything this page says it does not know?" | For example: passage e1 comes from a document whose **author is not recorded**; the **full text is not stored**, so a quote cannot be re-checked; changes since capture are not checked. Found via *How this reached you* or "Not known here". |
| C6 **Compare** | "A friend says their backup disk disappears on their Mac. Search for that, and tell me whether the top two results are the same problem." | *The disk vanishes about 45 seconds after U-Boot starts* vs *The backup disk appears, then drops or errors partway through reading*: same device and route, **different symptoms and outcomes**; the source says the maintainer separates them. Uses Compare, or reads both. |
| C7 **Predict** | Back on the USB record: "Add what happened for you: a data cable worked. **Before you submit**, tell me who will be able to see it, and what exactly will be sent." Then let them submit. | Prediction before reading the review is the measure: participants of this local room, not GitHub or ATProto; only the shown text and citations; search words stay in the browser. Note whether the review changed their prediction. |
| C8 **Rediscover** | "Find your note again." Then, in the Kai window: "Now you are someone else. Find what Mara wrote." | Uses *Search for…*, the permalink or the conversation. Kai finds it by search. |

Allow skips. If someone is stuck for 90 seconds, say "What would you try next?" once. If they are still stuck after
another 60 seconds, mark the task **with help**, show them the way, and move on.

## Neutral probes (use only these)
- "What are you looking for right now?"
- "What do you expect will happen?"
- "What makes you say that?"
- "Is there anything you're unsure about here?"

Never say "Try the trace", "Look at the badge", or name a UI element before the participant does.

## Debrief (5 minutes)
1. "Which of the two views would you use next time, and why?"
2. "Was there a moment you didn't trust what you were reading?"
3. "Was there anything you expected to find and didn't?"
4. "When you submitted, did anything surprise you about where it went?"

## After each session
1. Export JSON and Markdown from the sheet into a private folder. Clear the sheet.
2. Stop the session script with Ctrl-C. Delete the printed room folder unless consent covers keeping it.
3. Note within 10 minutes the one thing that surprised you most.

## What this kit cannot tell you
- Whether the Commons is better: there are too few people and the tasks are not representative.
- Anything about a real shared deployment: the room is local and empty except for what the participant adds.
- Anything about screen-reader users unless one takes part. Recruit at least one if possible, and note it.
