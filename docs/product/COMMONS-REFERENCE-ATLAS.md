# Commons reference atlas

1 November 2026 · Perplexity (assistant) · Design research input, not an implementation dependency list.

## Evidence limits and hierarchy

Original documentation, author explanations and repository descriptions were inspected during the design conversation. No reference was interactively tested in this session; do not describe these as usability findings. Features below are documented behaviour, while borrow/avoid recommendations are design interpretations. Recheck current behaviour and licences before reusing code. Do not install these projects simply because they are listed.

Visual north star for every phase: Cisco Cloud Control. Interaction north stars: coordinated views, inspectable mechanisms, contextual learning and clear consequences. Interaction references must not introduce competing visual skins.

## Cisco Cloud Control: visual shell and hierarchy

Documentation: https://www.cisco.com/c/en/us/td/docs/ai/cisco-cloud-control/collections/cisco-cloud-control-documentation.html
Inventory: https://cloud.cisco.com/docs/en/cisco-cloud-control-inventory/cisco-cloud-control-inventory.html
Administration: https://cloud.cisco.com/docs/en/cisco-cloud-control-administration/cisco-cloud-control-administration.html
Original source repository: none established; do not imply the product is open source.

Documented: centralised infrastructure inventory and topology; linked tenants can contribute inventory/topology data to a tenant group.
Inspect: overview-to-object detail, navigation/context, status and surface hierarchy using accessible screenshots/docs or authorised product access.
Match: user's explicitly selected look and feel.
Borrow: a product-specific interpretation of operational clarity, restrained chrome and readable contextual depth. Avoid: infrastructure-management IA, health dashboards, branding or invented private tokens.
Try/study: obtain the user's preferred screenshot/theme, annotate surface and selection roles, compare one implemented Commons workflow against it. Current evidence does not establish exact visual fidelity.

## Transformer Explainer: coordinated working explanation

Demo: https://poloclub.github.io/transformer-explainer/
Original repository: https://github.com/poloclub/transformer-explainer
Documented: interactive visualisation with a live GPT-2 model running in the browser.
Inspect: input, resulting prediction and the connected model operations.
Match: working functionality and education coexist; the user particularly liked its clean build.
Borrow: continuity between overview, selected element and actual mechanism. Avoid: mandatory full technical diagram and diagram-only accessibility.
Try: enter a short prompt, inspect one prediction and note what remains stable while changing depth.
Commons transfer: one result connects to actual passages, record interpretation and available retrieval information.

## RegExr: input, result and explanation together

Demo: https://regexr.com
Original repository: https://github.com/gskinner/regexr
Documented: live regex testing, matching highlights, contextual detail and learning/reference material.
Inspect: edit expression/sample text, inspect a match and a token.
Match: someone can work and learn without a separate tutorial.
Borrow: direct selection links between query, result and explanation. Avoid: formal query syntax as a prerequisite and essential hover-only information.
Try: change one expression token and inspect the changed matches.
Commons transfer: Why this matched is attached to a specific result and its real matching basis. Never invent an execution explanation after the fact.

## Diffusion Explainer: process with optional depth

Demo: https://poloclub.github.io/diffusion-explainer/
Original repository: https://github.com/poloclub/diffusion-explainer
Documented: browser-based visual explanation of text-to-image Stable Diffusion with preset prompts; installation/GPU not required to explore the published interface. Do not equate this with unrestricted live image generation.
Inspect: follow a preset prompt through the displayed transformation stages.
Match: readable architecture alongside a concrete outcome.
Borrow: compact process overview, selectable stages and related detail. Avoid: implying knowledge production is linear, complete or uncontested.
Try: compare presets and follow one stage into detail.
Commons transfer: source -> captured evidence -> interpretation -> result, with missing steps and unknowns explicit; contribution preview -> actual destination -> rediscovery.

## OpenRefine: preview, judgement and history

Product: https://openrefine.org/
Original repository: https://github.com/OpenRefine/OpenRefine
Docs: https://openrefine.org/docs/manual/cellediting
History: https://openrefine.org/docs/manual/running
Architecture: https://openrefine.org/docs/technical-reference/architecture-before-4
Documented: facets, transformation previews and undo/redo history; view filtering and data changes are distinct.
Inspect: narrow a dataset, preview/apply a transformation and revisit history.
Match: proposed interpretations and contributions need inspectable consequences.
Borrow: before/after preview and clear view-versus-change distinction. Avoid: spreadsheet density and treating shared contributions as one person's private undo stack.
Try: use a small synthetic CSV, filter, edit and step back.
Commons transfer: show what a proposed qualification changes, what stays untouched and who can accept it.

## Speedscope: selected-object context

Demo: https://www.speedscope.app/
Original repository: https://github.com/jlfwong/speedscope
Documented: interactive performance profiles; Left Heavy groups identical stacks; Sandwich focuses on a selected function's callers and callees.
Inspect: load a sample and select a function in Sandwich view.
Match: explore relations around one account without opening an undifferentiated graph.
Borrow: what led here -> selected thing -> what builds on it. Avoid: flamegraphs/profiler language and visual density.
Try: find one expensive function and inspect its immediate context.
Commons transfer: source question/passage -> observation -> replies, qualifications and corrections, with relationship origins explicit.

## Bret Victor: moving between levels of abstraction

Original interactive essay: https://worrydream.com/LadderOfAbstraction/
Original repository: not established in this review.
Documented author explanation: movement between concrete simulation and broader representations reveals different properties of a system.
Inspect: one example becoming trajectories and broader views.
Borrow: keep the concrete example intelligible as depth changes. Avoid: a compulsory sequential essay for daily use.
Try: follow one example through the levels and note selection/context continuity.
Commons transfer: passage -> account -> comparison -> relationship without losing the original question.

## Datasette: friendly view connected to explicit data

Product/docs: https://datasette.io/
Tutorial: https://datasette.io/tutorials/data-analysis
Original repository: https://github.com/simonw/datasette
Documented: interactive exploration/publication of data, API access and explicit SQL in the tutorial.
Inspect: narrow a published example and inspect the underlying data/query representation.
Borrow: shareable views and reachable records across human/machine entrances. Avoid: database vocabulary as the primary user model.
Try: use a linked example dataset, filter and inspect its data representation.
Commons transfer: browser/CLI/MCP reach consistent records; View record is contextual depth, not a separate debug world.

## Synthesis and evaluation

Recommended blend: experience-first reading + RegExr explanation links + Diffusion/Transformer process depth + OpenRefine preview + Speedscope contextual relationships, all expressed in the Cisco-inspired visual system.

Study interactions, not screenshots alone. Record actual observations separately after testing. Test the proposed Commons design against a simpler account view: can someone recognise applicability, explain a mismatch, distinguish source/interpretation, reach evidence and correctly predict what sharing exposes? Do not infer time savings or community impact from a successful demo.
