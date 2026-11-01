# PDF LAB — Perplexity research and sparring prompt

Research and challenge this concept as a technically rigorous collaborator. I want concrete prior work and a buildable laboratory, not a generic PDF feature list or encouragement.

## Context
We are incubating PDF LAB during BaselHack 2026, then moving it to its own repository. It is a sibling to an Excel laboratory with two equal tracks: MAKE IT WEIRD (creative format capabilities) and BREAK IT SAFELY (trust boundaries and defensive investigation).

The core question: One file, many interpreters—where do their realities diverge?

We want to compare what a human sees, what the file contains, what parsers extract, what viewers execute or block, and what an agent receives. The workbench has immutable specimens, reproducible recipes, named/versioned instruments, side-by-side evidence and an investigation notebook. Observation, inference and unknowns remain separate.

Concept and plan:
https://github.com/blackmath88/baselhack26-open-presence/tree/main/sideprojects/pdf-lab

XL LAB may be private. Do not claim to have read inaccessible sources. Its relevant pattern is question → specimen → prediction → instrument → observation → comparison → explanation.

## Research tasks
1. Map PDF's interesting capabilities: object graphs, content streams, text encoding/ToUnicode/ActualText, OCR layers, reading order and tags, optional content, forms, JavaScript, annotations, attachments/associated files, incremental updates, signatures and transformations. Explain what belongs to the format, a specific PDF profile or a particular viewer.
2. Find concrete creative precedents: games, calculators, branching narratives, interactive diagrams, evidence bundles, executable or computational documents. Verify source availability and actual viewer requirements. Which remain practical today?
3. Find primary research on visual/text disagreement, parser differentials, redaction failures, residual history, signature interpretation and PDF-to-LLM ingestion. Distinguish historical vulnerabilities from current demonstrated behaviour. Separate representation mismatch, reasoning error and prompt injection.
4. Assess existing instruments and corpora. Starting candidates: qpdf, pikepdf, Poppler, MuPDF/PyMuPDF, PDF.js, veraPDF, PDFium, Apache PDFBox, pdfminer.six, pyHanko, Didier Stevens' PDF tools and relevant academic corpora. Identify original repositories, licences, maintenance, reproducibility and coverage. Note shared engines so wrappers are not mistaken for independent evidence.
5. Propose a realistic consumer matrix: Acrobat/Reader desktop, browser viewers, Preview, command-line extractors, render-plus-OCR and agent ingestion. Mark documented support, measured support and unknowns distinctly. Do not invent a compatibility matrix.
6. Recommend five high-value synthetic experiments. For each give: question, mechanism, minimum construction recipe, expected observations (labelled hypotheses), controls, instruments, falsifier, effort and demo value. Include a baseline, visually equivalent PDFs with differing extraction, redaction comparison, incremental update and one creative interactive document.
7. Challenge the concept. What is already solved? Where would we duplicate mature software? What apparent disagreements are legitimate representations? What claims cannot be inferred from screenshots, hashes, text extraction, signatures or an LLM answer? Is a shared XL/PDF framework premature?
8. Explain the relevance and limits for our Adobe topic: PDF offers a cultural expectation of stable transmission; agent-mediated information raises questions about provenance, context and interpretation. Do not claim PDF guarantees truth, authenticity or universal rendering.

## Required output
A. A clear verdict: strongest idea, weakest assumption, recommended first build.
B. An annotated prior-work table with direct primary links, dates/versions, contribution and what we can reuse.
C. A capability/consumer matrix that makes unknowns visible.
D. Five experiment cards with reproducible evidence and meaningful negative outcomes.
E. Minimal architecture and a concrete first implementation slice; prefer adapting tools.
F. Ten difficult sparring questions, plus your provisional answers.
G. A claim ledger: verified fact / source-reported result / inference / proposal / unresolved.
H. What to abandon, defer and investigate next.

Use official specifications, vendor documentation, original repositories and original papers. Link every substantive technical claim. Verify current maintenance and compatibility rather than relying on old examples. State the research date and inaccessible sources.

Keep creative exploration and defensive testing equally visible. Use synthetic owned specimens and harmless local demonstrations; no weaponized documents or third-party targeting. Avoid generic dashboards, unsupported vulnerability scores and claims of novelty without checking prior work.
