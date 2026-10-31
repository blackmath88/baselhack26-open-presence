# Project memory — dated context for assistants

The project owns its memory: the documents selected by [.observstory/knowledge.json](../../.observstory/knowledge.json),
every first-parent revision of them, and the proposals and reviews in [.observstory/proposals](../../.observstory/proposals/).
Assistants receive **dated views** of it and return findings as proposal files. Nothing here is an approval.

## Context packets in this folder

Each packet is one projection (Observstory `memory.context_packet`) in two forms with the same `packet_id`:
JSON for tools, Markdown for chat. The id is a hash of the content, so the same request on the same recorded state
is byte-identical. They were issued by the NUC Project Memory host (Knowledge Lab, receipt recorded there).

| packet | for | task | cutoff |
| --- | --- | --- | --- |
| [cp_7cdc6f026054f6d6650d202f](context/cp_7cdc6f026054f6d6650d202f.md) | Claude | find-and-inspect journey: concept, decisions, questions, research basis | `93a5445` (origin/main #43) |
| [cp_49910240c91373d872f079ac](context/cp_49910240c91373d872f079ac.md) | ChatGPT | architecture sparring: decided, proposed, open | `93a5445` (origin/main #43) |

Both carry the same record versions (e.g. `concept-human-signal` @ `rv_6a8ab768e85dc2538a0f`, blob `0704df3`).
They describe that commit, not later ones: check `cutoff` before relying on them. A newer packet supersedes
nothing; it is another dated view.

## How each assistant reads it today

- **Claude Code / Orca on the NUC:** live, through the read-only MCP server (`knowledge-lab memory mcp`) or the CLI
  (`knowledge-lab memory context "TASK"`). Same projection, fresh cutoff.
- **ChatGPT or Claude on the web:** no live connector. Paste or upload a Markdown packet from this folder, or give the
  public GitHub URL of the file. That is a manual file handoff, not an installed integration.

Return a finding as `.observstory/proposals/<id>.json` with the packet's `packet_id` as `base.context_packet_id`.
