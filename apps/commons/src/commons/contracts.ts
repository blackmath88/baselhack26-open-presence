// Frozen shared contracts for the Photo Frame Commons slice (bootstrap).
// Packets A (corpus/retrieval) and B (shared memory) consume these types; change
// them only through the coordinator. See docs/build/CLAUDE-ORCA-BUILD.md.

export type Availability = 'captured' | 'cache-only' | 'unavailable' | 'excluded';

/** A pointer into the pinned public snapshot. Never a room event. */
export interface SourceRef {
  snapshotId: string; // e.g. "commons-001@0bff55ef3fb2"
  objectId: string; // original issue/pr/discussion/comment/doc id, e.g. "issue/99" or "comment/123"
  permalink: string;
  author: string | 'unknown'; // original source author, never the record writer
  sourceTime: string | null; // ISO time from the source
  retrievedAt: string; // snapshot capture time
  digest: string | null; // sha256 of captured text; changed digest = changed text
  locator: string | null; // passage locator within the object
  availability: Availability;
  coverageNote?: string;
}

export interface EvidenceQuote {
  id: string;
  role: string; // report | fix | correction | ...
  source: SourceRef;
  quote: string | null; // verbatim substring of the source (short)
  interpretation: string | null; // record writer's words, never the author's
}

/** A Postack agent-written problem record, imported read-only. */
export interface ImportedProblem {
  postackId: string;
  title: string;
  device: string[];
  environment: string[]; // reported conditions
  symptoms: string[];
  aliases: string[]; // writer-added search vocabulary
  status: string;
  statusNote: string | null;
  evidence: EvidenceQuote[];
  outcomes: string[];
  related: Array<{ problemId: string; relation: string; origin: 'postack-agent' | 'source'; evidenceIds: string[] }>;
  corrections: Array<{ id: string; note: string; evidenceIds: string[] }>;
  provenance: {
    authoredBy: string; // e.g. agent:claude-opus-5-5
    review: 'unreviewed' | 'reviewed';
    originCommit: string; // Postack commit the record was ported from
    snapshotRevision: string; // underlying Wes Bos revision
  };
}

export interface SearchHit {
  problemId: string;
  rank: number;
  matches: Array<{ field: 'title' | 'symptoms' | 'aliases' | 'environment' | 'device' | 'quote'; term: string; text: string; writerVocabulary: boolean }>;
  nearMatch: boolean; // matched, but reported conditions differ from the query
  explanation: string;
}

/** Read interface Packet A provides (pure, deterministic, no network). */
export interface CommonsReader {
  search(query: string, limit?: number): SearchHit[];
  problem(id: string): ImportedProblem | undefined;
  source(objectId: string): SourceRef | undefined;
  problems(): ImportedProblem[];
}

/** Deterministic room mapping for an imported problem (Packet B). */
export const importedProblemSpaceId = (postackId: string) => `commons:${postackId}`;
export const importedContributionId = (postackId: string, evidenceId: string) => `commons:${postackId}:${evidenceId}`;

/** Browser-only draft; never sent until explicitly submitted. */
export interface Draft {
  id: string;
  problemId: string;
  text: string;
  circumstances?: string;
  sourceRefs: string[]; // objectIds
  savedAt: string;
}

/** Body of POST submit; participant is resolved by the server, never sent. */
export interface SubmitContributionCommand {
  commandId: string; // idempotency key; same key + different body => 409
  problemId: string;
  text: string;
  circumstances?: string;
  sourceRefs: string[];
  preparedBy?: string; // e.g. "browser-draft"; authoredBy is the server-resolved participant
}

export interface ReviewCommand {
  commandId: string;
  proposalId: string;
  decision: 'accept' | 'reject';
  expectedVersion?: number;
}

export type EdgeOrigin = 'participant' | 'machine-proposal' | 'source-assertion' | 'postack-agent';
