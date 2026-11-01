CREATE TABLE commons_state (
  id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL, document TEXT NOT NULL
);
INSERT INTO commons_state VALUES (1, 0, '{"events":[],"metadata":{}}');
CREATE TABLE commons_commit_guard (
  id TEXT PRIMARY KEY,
  valid INTEGER NOT NULL CONSTRAINT commons_revision_matches CHECK (valid = 1)
);
CREATE TABLE contributor_tokens (
  token_hash TEXT PRIMARY KEY, actor_id TEXT NOT NULL, display_name TEXT NOT NULL,
  expires_at TEXT NOT NULL, revoked INTEGER NOT NULL DEFAULT 0,
  can_review INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE write_budgets (
  bucket TEXT PRIMARY KEY, used INTEGER NOT NULL
);
