# Open Presence: implementation inputs

Destination: blackmath88/baselhack26-open-presence/docs/domain/IMPLEMENTATION-INPUTS.md
Checked/accessed 2026-10-30. Application schemas and named business tools below are OUR DESIGNS, not Schema.org, AT or MCP standard hotel APIs.

## Vocabulary before new fields

| Concept | Existing vocabulary | Application extension/limit |
|---|---|---|
| Property | schema:Hotel, identifier/name/address, containsPlace | Owner authority/delegation not established by markup |
| Physical accommodation | HotelRoom, containedInPlace, occupancy (QuantitativeValue), petsAllowed, amenityFeature | Separate RoomType ID/group and physical room ID; capacities include infants [O1] |
| Offer/prices | Offer, priceCurrency, priceSpecification / UnitPriceSpecification, validFrom/validThrough | Per-night/per-stay decomposition, taxes/fees inclusion and quote expiry explicitly scoped; validThrough is not the stay's checkout date |
| Reservation | LodgingReservation, reservationId/status, reservationFor, bookingTime, checkinTime/checkoutTime, numAdults/numChildren, totalPrice | Actual confirmed simulation only, not quote; private guest fields never published [O2] |
| Policies | petsAllowed Boolean/Text and descriptive terms | Versioned scope, effective interval, cancellation and detailed constraints are our fields, not a universal ontology |

## Minimum fields and constraints

Property{id,timezone='Europe/Zurich',currency='CHF',revision}; RoomType{id,capacityPersons positive int,policies}; Room{id,typeId,outOfServiceDateIntervals}; Stay{arrivalDate,departureDate YYYY-MM-DD,adults positive int,children nonnegative int,arrivalLocalTime HH:MM,petCount nonnegative int}; availability{observedAt UTC,stay,eligibleRoomIds}; policy{id,version,effectiveFrom UTC,validUntil nullable,scope,withdrawn,claims[]}; quote{id,stay,roomTypeId,policyVersions,rateVersion,lines[],totalMinor nonnegative safe integer,currency,createdAt,expiresAt,cancellationSnapshot,status}; reservation{id,quoteId,physicalRoomId,acceptedSnapshot,state,actorId,createdAt}; idempotency{actorId,operation,key,canonicalPayloadHash,result,createdAt}. Null/unknown is not false/zero. Reject non-CHF rather than silently convert. Scope every line's unit: room_night, stay, pet_stay. Sum explicit lines; no floating arithmetic for money.

```json
{"fictional":true,"property":{"id":"hotel-demo","name":"Fictional Courtyard Basel","timezone":"Europe/Zurich","currency":"CHF","revision":1},"roomTypes":[{"id":"courtyard","capacityPersons":2,"petsPolicy":"one_dog","lateCheckinUntil":"23:59"}],"rooms":[{"id":"C1","typeId":"courtyard","outOfServiceDateIntervals":[]}],"quote":{"id":"q-demo","stay":{"arrivalDate":"2026-11-10","departureDate":"2026-11-12","adults":2,"children":0,"petCount":0,"arrivalLocalTime":"18:00"},"policyVersions":["p1"],"rateVersion":1,"lines":[{"unit":"room_night","quantity":2,"unitMinor":14000},{"unit":"stay","quantity":1,"unitMinor":2000,"label":"fictional inclusive fee"}],"totalMinor":30000,"currency":"CHF","createdAt":"2026-10-30T13:00:00Z","expiresAt":"2026-10-30T13:10:00Z","cancellationSnapshot":{"freeUntil":"2026-11-09T17:00:00Z","afterCutoff":"manual_review"},"status":"offered"}}
```

## Source-to-rule table

| ID/source and date | Exact URL | Verified scope/limitation |
|---|---|---|
| O1 Schema.org HotelRoom; V30.1, 2026-09-16 | https://schema.org/HotelRoom | Occupancy includes infants, petsAllowed Boolean/Text, amenities not necessarily free; vocabulary not booking logic |
| O2 Schema.org LodgingReservation; V30.1 | https://schema.org/LodgingReservation | Actual reservation vocabulary, totalPrice includes applicable charges; no inventory concurrency semantics |
| O3 AT Repository v3, living spec | https://atproto.com/specs/repository | Public signed repo, URI path/CID distinction; prev usually null, deletions/history not guaranteed; older key verification can be ambiguous |
| O4 AT identity, living guide | https://atproto.com/guides/identity | Bidirectional handle/DID resolution, key/PDS discovery; does not verify business authority/truth |
| O5 Lexicon v1, living spec | https://atproto.com/specs/lexicon | $type records, integer/string types, validation modes; optimistic default can fail open; DNS-based namespace authority |
| O6 MCP Tools, 2026-07-28 latest | https://modelcontextprotocol.io/specification/latest/server/tools | tools/list, tools/call, inputSchema, structuredContent, isError; modern required metadata/version handling must match client |
| O7 Chrome WebMCP, updated 2026-10-07 | https://developer.chrome.com/docs/ai/webmcp | Origin trial from 149; chrome://flags/#enable-webmcp-testing; visit site, tools permissions policy; inspector/agent extensions separate from Gemini in Chrome |
| O8 WebMCP draft, 2026-10-27 | https://webmachinelearning.github.io/webmcp/ | document.modelContext registerTool/getTools/executeTool, secure context; draft not W3C Standard; cancellation isn't backend rollback |
| O9 AT getRecord | https://docs.bsky.app/docs/api/com-atproto-repo-get-record | GET /xrpc/com.atproto.repo.getRecord, specific operation says no auth required; generic page banner is broader |
| O10 AT putRecord | https://docs.bsky.app/docs/api/com-atproto-repo-put-record | POST /xrpc/com.atproto.repo.putRecord creates/updates; requires authenticated PDS access. Detailed request schema not exposed in extracted page; obtain pinned Lexicon/SDK before integration |

Rule effective dates: all fictional hotel terms apply only to fixture dates and stored versions; no legal tariff, tax/cancellation right or real hotel rate has been verified. Ten-minute quote validity is a fixture assumption, not an industry standard.

## Proposed smallest business tools over one transaction service

- get_property({propertyId}) -> current public revision, policies/claims with source, unknowns.
- quote_stay({propertyId,stay}) -> offered quote or {code,missingFields}; no hold. price/terms authoritative from backend, not agent arguments.
- confirm_reservation({quoteId,idempotencyKey,confirmationToken}) -> reservation or structured error. Token minted after human reviewed exact terms, scoped to actor/quote/version; boolean supplied by agent alone insufficient.
- get_reservation({reservationId}) -> authorized status/receipt; handle is not authorization.
- cancel_reservation({reservationId,idempotencyKey,confirmationToken}) -> cancelled/manual_review or error.
Owner edit operation is separate, authenticated, revision-checked and NOT exposed to guest agent. Errors: INVALID_STAY, UNSUPPORTED_OCCUPANCY, NEEDS_REVIEW, QUOTE_EXPIRED, POLICY_CHANGED, SOLD_OUT, IDEMPOTENCY_CONFLICT, FORBIDDEN. All our design codes.
MCP adapter validates input/output, wraps domain errors with isError, uses client's negotiated spec. WebMCP registers page tools with inputSchema/execute and calls SAME backend; DOM/localStorage is not the authority for competing bookings. Tool annotations are hints, not controls. Receipt snapshots returned, no hidden connection session assumptions. [O6,O8]

## AT publication and verification contract

Publish only profile, offering description, policy and service-reference records under a controlled namespace; local illustrative org.example.openpresence.* is not publishable authority. Policy record fields: $type, policyId, scope, version integer, terms bounded string, effectiveFrom datetime, withdrawn boolean, serviceRef URI. Reference record URI plus observed CID; retain snapshot and signed commit/proof separately. No fake DID/CID is provided as valid cryptographic evidence.
Read getRecord from discovered PDS; successful read != independent signature verification. For verified badge resolve DID/key, check signed commit and MST inclusion/CIDs using tested library, validate schema and current service freshness. On correction update same rkey, record new CID; do not promise historical getRecord retrieval merely because optional CID lookup exists elsewhere. Authenticated putRecord schema, swap/CAS semantics and permissions must be read from pinned Lexicon before implementation; unavailable details must not be guessed. No account creation/publication authorized by this pack.

## Resources, substitutes, mentor blockers

[U] Browser build, trial access, API keys, compatible agent/client, AT identity/domain/PDS credentials, independent verification library/test vectors and actual hotel authority unavailable/unverified. Substitute: local owner/API/booking simulation; manual source inspector; local schema validation labelled NOT protocol interoperability. Browser flag alone proves neither model invocation nor interoperability. Record actual browser/SDK/spec versions and a tools/list->call transcript before making that claim.
P0 coding: agree room allocation/cancellation/price fixtures and confirmation boundary (defaults above usable). P0 protocol claim: actual compatible browser/client and PDS identity; obtain exact write schema/auth. P1: business authority/delegation evidence, conflicting claims and cancellation exceptions; production money/legal rules require hotel/legal expert. P2: open-web discovery adoption. No global index or paid hosting needed.
