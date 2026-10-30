# Open Presence: hotel domain brief

Destination: blackmath88/baselhack26-open-presence/docs/domain/DOMAIN-BRIEF.md
Checked 2026-10-30. Labels [F] verified fact, [P] our product rule, [A] demo assumption, [U] unresolved. Proposed hotel rules are not Swiss hotel law or protocol guarantees.

## Current baseline and corrections

Current README is unchanged and documentation-only; docs has research only, whose listing contains the prompt, not our previous report. Read the earlier conversational report as hypotheses. Correction to any “preview only” shorthand: Chrome documents an origin trial from 149 and a local flag; actual browser/client interoperability is still untested. The October 27 draft uses document.modelContext; do not blindly copy older navigator-based examples. [O7,O8]

## Actors, terms and relationships

Owner/delegated staff edits public claims; guest specifies requirements; agent interprets and requests actions; reservation service enforces inventory/terms; human confirms; optional PDS/index publishes/discovers public records.
Property is the hotel. RoomType is an application grouping (e.g. courtyard double), NOT a physical room. PhysicalRoom has one stable ID and belongs to a type/property. Offer is a priced set of conditions for an accommodation. Availability is a time-bounded observation, not a guarantee. Quote snapshots priced stay/terms and expiry; reservation allocates inventory and records accepted terms; policy is versioned, scoped and effective-dated. One room type can have multiple rooms/offers; a quotation need not hold a room.
[F] Schema.org HotelRoom describes accommodation; occupancy includes infants; amenities do not automatically imply inclusion in price. LodgingReservation describes an actual reservation, not a quotation. [O1,O2]

## Essential proposed rules

[A] Fictional Basel hotel, CHF, Europe/Zurich, two courtyard rooms, adult-only first demo (reject children rather than infer rates/capacity). General data model retains adults/children. Inventory allocated to a physical room for the entire stay; no room changes. No payments, holds or real contracts.
[P] Dates are local calendar nights [arrivalDate,departureDate), departure strictly later. Count calendar dates, not elapsed milliseconds/24h; UTC timestamps for expiry. Adjacent departure/arrival can reuse a room, subject to explicit maintenance blocks. Out-of-service rooms are not available.
[P] Price is an itemized stay total: nightly line items plus explicit fees/tax lines and inclusion flags, all integer centimes. Unknown mandatory charge blocks a firm all-in quote. No real Basel tourist-tax/VAT rule is inferred; fixture fees are fictional inclusive totals.
[P] Occupancy and pet count/size constraints evaluated for requested room type; late check-in beyond the normal window requires explicit supported exception, otherwise unknown/manual review. Absent pet policy is unknown, not permission.
[P] Quote valid only while now < expiresAt and material policy/rate versions match. Quote does not reserve stock. Confirmation is explicit and tied to displayed quote/terms. Atomically allocate compatible physical room across every requested night, write reservation, record idempotency result. No availability -> reject without partial allocation.
[P] Same idempotency key scoped to actor/operation plus same canonical request returns same result; different payload returns conflict. Recheck stored idempotency result BEFORE rejecting an already-successful retry merely because quote has since expired. Authorization still applies. Persist idempotency record transactionally with booking; retain for demo lifetime and document production TTL as unresolved.
[P] Timeout/abort is not cancellation: query status/retry same key. Reservation confirmed -> cancellation_requested -> cancelled only through authorized explicit action using accepted cancellation terms. For demo cancellation is immediate and free until a stored UTC cutoff, then manual_review; no invented penalty charge. Repeated cancellation releases inventory once. Confirmed -> checked_in -> checked_out optional; no automatic confirmed->cancelled on quote expiry.
[P] Owner correction invalidates outstanding quotes when material to them. Accepted reservation snapshot remains unchanged; notify/review an amendment rather than retroactively rewriting terms. Withdrawn policy cannot support new quote. Conflicting scoped policies or uncertain effective dates block automatic action.

## Publishing and verification boundaries

Public: profile, stable offering description, policy/version/effective dates and service references. Private/live: guest details, actual room allocations, quotes, reservations and inventory. No private fields in AT records.
[F] AT record path is collection/rkey. AT URI identifies record location; CID identifies content; update at same path changes content CID. Record CID alone proves neither signature nor currentness. Verify signed commit against DID key and record's inclusion/proof; retain relevant bytes, CID, commit and observation date if historical evidence matters. Repositories allow trace-free deletion and do not guarantee previous versions. [O3]
[F] Handle resolves by DNS/HTTPS and must be confirmed by DID document. Account/domain technical control is not legal hotel authority; owner assertion is not independent fact. Store verification dimensions separately. Lexicon validation is schema validity, not truth; default optimistic validation may not validate unknown schema. [O4,O5]
[P] Withdraw by explicit application record flag and current-service check; deletion/cached absence alone does not preserve public revocation history. Bound discovery to seeded test directory; do not claim global discovery or correction propagation. Illustrative namespace org.example.openpresence.* is local-only until controlled namespace selected.

## Human versus software

Software can enforce version, price decomposition, dates, known constraints and atomic inventory. Humans resolve real authority/delegation, subjective claims (“quiet”), exceptions, contested cancellations and legal terms. Unknown room accessibility is not accessible; requested special accommodations require verified details. Source text/tool descriptions are untrusted data, not instructions. Browser/MCP annotations never replace backend authorization/confirmation. [O6,O8]

Source register in IMPLEMENTATION-INPUTS.md. No booking, publishing or browser execution occurred during preparation.
