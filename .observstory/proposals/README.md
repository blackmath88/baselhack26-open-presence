# Proposals and findings (write-back)

People and assistants return what they learned here as `observstory.proposal/v1` JSON files, one per file,
through a pull request. A file in this folder **approves nothing**. It travels in every later context packet
labelled `unreviewed` until a human review record exists in `.observstory/reviews/`.

Required: `id` (slug, = file name), `kind` (`finding` | `proposal`), `title`, `statement`, `author`
(`name`, `kind`: `human` | `assistant`, optional `via`), `submitted_at`, `base` (`repository`, full `commit`,
optional `context_packet_id`), `evidence` (records as `record` + `version_id`, or `path`), `conditions`,
optional `proposed_change` (`none`, `set_status`, `add_link`, `end_link`, `add_record`).
Schema: [observstory schema/proposal-v1.json](https://github.com/blackmath88/observstory/blob/feat/project-memory-mvp/schema/proposal-v1.json).

Create one with an Observstory checkout:

```bash
python3 /path/to/observstory/scripts/observstory.py memory propose --id finding-x --kind finding \
  --title "…" --statement "…" --author "Your name or assistant" --author-kind human|assistant \
  --repository-name blackmath88/baselhack26-open-presence --base-commit <sha> --packet-id <cp_…> \
  --evidence concept-human-signal@rv_… --condition "…" --out .observstory/proposals/finding-x.json
```

## Reviews

A review is `.observstory/reviews/<proposal-id>.json` (`observstory.review/v1`): `proposal`, `outcome`
(`accepted` | `rejected` | `superseded` | `needs_changes`), `reviewer` with `kind: "human"`, `reviewed_at` and a
`basis` naming the act it records — normally the approving pull-request review URL (`github_pr_review`), or a named
confirmation as with `checkin confirm`. An assistant cannot review. Accepting a proposal does not change the source
document; if it proposes a status change, the context shows *accepted, not yet in source* until the document says so.
Disagreement, failed approaches and exceptions stay in history with their scope.
