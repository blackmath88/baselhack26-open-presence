# Open Presence: five acceptance cases

Destination: blackmath88/baselhack26-open-presence/docs/domain/BUILD-CASES.md
As of 2026-10-30. All prices/policies are fictional [A]; outcomes [P] are application acceptance rules, not official hotel prices or legal advice. Sources O1-O8 in IMPLEMENTATION-INPUTS.md.

## OP1 — normal success, all-in quote then booking
Input: 2026-11-10 to 2026-11-12, 2 adults, 0 children, no pet, arrival 18:00 Europe/Zurich. Room C1 available throughout. Nightly line items CHF 140 each; one fictional inclusive stay fee CHF 20; no other charge; policy p1. Clock 2026-10-30T13:00:00Z; expiry 13:10:00Z.
Expected: 2 nights; nightlySubtotalMinor=28000, feesMinor=2000, totalMinor=30000 CHF. Explicit guest confirmation -> one simulated reservation allocates C1 on both nights and stores p1/price snapshot. Website, MCP adapter and receipt read same reservation ID.
Visible: “CHF 300 total for 2 nights, including listed fictional fee; simulation, no payment.”
Prohibited: CHF 300 per night; confirmed from availability/read call alone; real tourist-tax compliance; quote as guaranteed stock.

## OP2 — meaningful variation, scoped pets and late arrival
Input: OP1 stay, one dog, 23:30 arrival; courtyard policy permits one dog with fictional CHF 15/stay, self-check-in confirmed until midnight; street room prohibits dogs. Both room types otherwise available.
Expected: only courtyard eligible; totalMinor=31500, itemized dog fee. Carry local arrival date/time and policy scope into quote. Total occupancy must satisfy room capacity, not count dog as a human. If request includes a child, return UNSUPPORTED_OCCUPANCY for this adult-only demo, not silently discard child.
Visible: “Courtyard room supports one dog and 23:30 self-check-in under p1; CHF 315 total.”
Prohibited: hotel-wide unconditional pets allowed; special arrival guaranteed merely from normal check-in hours; hide fee.

## OP3 — ambiguous/missing information
Input: no pet policy; guest asks about a dog, late arrival and quiet room; taxes/mandatory fee status unknown. Cached AT policy cid-old conflicts with current service p2.
Expected: return NEEDS_REVIEW, enumerate pet/arrival/fee unknowns and subjective noise claim; refresh authoritative policy and display conflict. No confirmable all-in quote until required terms resolved; do not let a successful record fetch set signatureVerified=true. [O3-O5]
Visible: “The cached description differs; we cannot confirm pet acceptance, total price or quietness.”
Prohibited: absence means pets allowed; signed claim means true; CID proves latest version; confirm booking against cached terms.

## OP4 — failure, competing last-room bookings
Input: single compatible room C1, identical dates, two valid quotes qA/qB, different authorized actors/keys, concurrent confirmations.
Expected: exactly one confirmed reservation; loser SOLD_OUT; no negative stock or partial-night allocation. Winner's retry after response timeout, even after quote expiry, same key and payload returns original ID. Same key/different payload -> IDEMPOTENCY_CONFLICT. Cancellation by wrong actor -> FORBIDDEN, no inventory change.
Visible: winner confirmation receipt; loser “Room no longer available; nothing booked.” Timeout initially “Outcome not yet known,” followed by status lookup.
Prohibited: two successes; client timeout means not booked; compensate by silently cancelling winner; a second charge/action on retry.

## OP5 — correction/retry plus cancellation
Input: unaccepted q1 uses pets allowed p1; owner publishes immediately effective p2 disallowing pets, guest confirms q1. Separate already-confirmed r1 retains p1 snapshot. Guest then requests fresh no-pet quote and confirms; later cancels before that reservation's stored cancellation cutoff.
Expected: q1 -> POLICY_CHANGED, zero allocation; fresh supported quote may book. r1 accepted terms unchanged, correction flagged for human amendment review. Authorized cancellation before cutoff -> cancelled, room released exactly once; same cancel request repeats same result. After cutoff -> manual_review, no automatic refund/penalty claim or room release until approved.
Visible: “Terms changed; review a new quote.” Existing booking: “Accepted p1 retained.” Cancelled booking: “Simulated cancellation confirmed; no real refund.”
Prohibited: mutate accepted booking to p2, infer user accepted new terms, delete audit trail, double-release inventory.
