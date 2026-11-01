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
  problemId?: string; // room the caller is reviewing in; must contain the proposal
  decision: 'accept' | 'reject';
  reason?: string; // recorded on rejection; part of the idempotency hash
  expectedVersion?: number;
}

export type EdgeOrigin = 'participant' | 'machine-proposal' | 'source-assertion' | 'postack-agent';

// ---------------------------------------------------------------------------
// Multi-entry extension — frozen 2026-10-31 (M0). Compatible additions only:
// every field above keeps its meaning; new fields are optional on input and
// defaulted on read. See docs/architecture/MULTI-ENTRY-IMPLEMENTATION.md.
// ---------------------------------------------------------------------------

/** Bumped only when a persisted shape changes; `commonsMetadata` migrates forward. */
export const COMMONS_SCHEMA_VERSION = '2026-10-31.1';

/** Kinds a participant can give a new Commons contribution. */
export type CommonsContributionKind = 'question' | 'observation' | 'attempt' | 'outcome' | 'correction';
export const COMMONS_CONTRIBUTION_KINDS: CommonsContributionKind[] = ['question', 'observation', 'attempt', 'outcome', 'correction'];

/**
 * How the text was prepared. A declaration by the submitter, never a detection:
 * `none` means typed directly, `ai-assisted` means a model helped, `ai-drafted`
 * means a model wrote the draft the person submitted.
 */
export type AssistanceDeclaration = 'none' | 'ai-assisted' | 'ai-drafted';
export const ASSISTANCE_DECLARATIONS: AssistanceDeclaration[] = ['none', 'ai-assisted', 'ai-drafted'];

/** Discriminated references. A local ID is never an AT URI and a source object is neither. */
export type LocalRef = { kind: 'local'; id: string; revision?: number };
export type SourcePointer = { kind: 'source'; objectId: string; snapshotId?: string; digest?: string | null };
/** `cid` pins one exact version; without it the reference names the logical record. */
export type AtRef = { kind: 'atproto'; uri: string; cid?: string };
export type Ref = LocalRef | SourcePointer | AtRef;

export type PublicationStatus = 'local' | 'queued' | 'publishing' | 'published' | 'failed' | 'conflict' | 'stale' | 'unavailable';

/** Transport receipt. Independent of the local contribution: queued is not published. */
export interface PublicationReceipt {
  intentId: string;
  contributionId: string;
  revision: number;
  status: PublicationStatus;
  did: string;
  handle?: string;
  collection: string;
  rkey: string;
  uri?: string;
  cid?: string;
  payloadDigest: string;
  attempts: number;
  queuedAt: string;
  lastAttemptAt?: string;
  publishedAt?: string;
  lastError?: string;
}

/** A content-bound intent: changing text, account or revision invalidates it. */
export interface PublicationIntent {
  intentId: string;
  contributionId: string;
  revision: number;
  actorId: string;
  did: string;
  handle?: string;
  service: string;
  collection: string;
  rkey: string;
  payloadDigest: string;
  record: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export type ExternalAvailability = 'available' | 'stale' | 'unavailable' | 'deleted' | 'invalid';

/** Where an ingested contribution lives: the author's repository, observed by us. */
export interface ExternalOrigin {
  kind: 'atproto';
  uri: string;
  cid: string;
  did: string;
  handle?: string;
  pdsEndpoint?: string;
  retrievedAt: string;
  availability: ExternalAvailability;
  /** Set when the record's declared origin matched a contribution this app published. */
  selfPublicationOf?: string;
}

/**
 * Which adapter carried the submission in. Declared by the adapter (MCP sets it
 * server-side; the browser and CLI declare it over HTTP), never detected and
 * never authorization. Absent on older records: `unknown`. Ingested records are `atproto`.
 */
export type CommonsEntrance = 'browser' | 'cli' | 'mcp' | 'http' | 'atproto' | 'unknown'
export const SUBMIT_ENTRANCES = ['browser', 'cli', 'mcp', 'http'] as const
export type SubmitEntrance = (typeof SUBMIT_ENTRANCES)[number]

export interface CommonsActor {
  id: string; // person:<x> | did:… | repo:<owner/name>
  displayName?: string;
  kind: 'participant' | 'atproto' | 'import';
}

/** One attributable contribution as every entrance sees it. */
export interface CommonsContribution {
  id: string;
  revision: number;
  problemId: string; // Postack ID
  roomId: string; // commons:<problemId>
  kind: CommonsContributionKind;
  text: string;
  circumstances?: string;
  sourceRefs: SourceRef[];
  actor: CommonsActor;
  submittedBy: string;
  assistance: { declared: AssistanceDeclaration; preparedBy?: string };
  createdAt: string;
  observedAt?: string;
  parent?: Ref;
  supersedes?: Ref;
  contradicts?: Ref;
  origin: { kind: 'local' } | ExternalOrigin;
  entrance: CommonsEntrance;
  /** Exact evidence passages of the problem record this contribution cites (subset of its sourceRefs' objects). */
  evidenceIds?: string[];
  publication: PublicationReceipt | null;
  links: { app: string };
}

/** What a hidden or blocked record returns on every projection: no body, no author text. */
export interface ModeratedContribution {
  id: string;
  problemId: string;
  roomId: string;
  moderated: true;
  reason: 'hidden' | 'blocked-author' | 'deleted' | 'invalid';
  createdAt?: string;
}

export const isModerated = (c: CommonsContribution | ModeratedContribution): c is ModeratedContribution => 'moderated' in c;

/** Submit body, extended compatibly. Unknown new fields default: kind=observation, assistance from preparedBy. */
export interface SubmitContributionCommandV2 extends SubmitContributionCommand {
  kind?: CommonsContributionKind;
  assistance?: AssistanceDeclaration;
  /** Reply target: a local contribution id in the same problem, or an at:// URI already ingested. */
  parentId?: string;
  supersedesId?: string;
  contradictsId?: string;
  observedAt?: string;
  /** Cite exact passages of the problem record by evidence id (e.g. "e2"); their source objects join sourceRefs. */
  evidenceIds?: string[];
  /** Adapter that carried this command; excluded from the idempotency hash, first recorded value wins. */
  entrance?: SubmitEntrance;
}

export interface CommandReceipt {
  commandId: string;
  replayed: boolean;
}

/**
 * Canonical deep links. Hash routes so a static UI resolves them after reload.
 * The optional query/selection only carry the searcher's context (which situation led here, which
 * result to return to); without them a link is exactly the canonical one.
 */
export const appLinks = {
  /** `trace` opens one passage's lineage, optionally at one stage. */
  problem: (problemId: string, query?: string, trace?: { passage: string; stage?: string }) => {
    const params = [query && `q=${encodeURIComponent(query)}`, trace && `trace=${encodeURIComponent(trace.passage)}`, trace?.stage && `stage=${encodeURIComponent(trace.stage)}`].filter(Boolean)
    return `#/problems/${encodeURIComponent(problemId)}${params.length ? `?${params.join('&')}` : ''}`
  },
  contribution: (contributionId: string) => `#/contributions/${encodeURIComponent(contributionId)}`,
  thread: (contributionId: string) => `#/threads/${encodeURIComponent(contributionId)}`,
  repository: (path = '') => `#/repo${path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : ''}`,
  search: (query: string, selected?: string, compare: string[] = []) =>
    `#/search?q=${encodeURIComponent(query)}${selected ? `&selected=${encodeURIComponent(selected)}` : ''}${compare.length ? `&compare=${compare.map(encodeURIComponent).join(',')}` : ''}`,
  compare: (a: string, b: string, query?: string) =>
    `#/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}${query ? `&q=${encodeURIComponent(query)}` : ''}`,
};
