# How many readings does one PDF have?

4 November 2026 · Proposed test-suite direction. The cabinet already contains the experiments below. The suggested viewer trials, model trials and suite integration are open.

Start with an operation a reader can perform: copy a line, print a puzzle, switch a layer, rewrite the file. Predict what that operation will reveal. Preserve the original bytes and record what the particular instrument returned. This lets a poem count as a successful experiment even when no model is involved.

## First case ready to repeat

[Four booking policies, generator, evidence and local runner](experiments/booking-policy/README.md). Three vector files share identical rendered pixels in the recorded Poppler comparison. Only the decoded character-map object differs. Two extractors read the alternate instruction and the fee together. OCR returns the visible fee and ordinary footer. The benign variant changes the footer wording without addressing the model. Zero model trials have been run. Independent scoreable questions are whether the alternate reaches the input, whether the model omits the fee, and whether the clean or benign file produces the same omission. A missing native excerpt in the raster control is an ingestion result.

## Build out from existing quirks

| Order and family | Smallest discriminating test | What to keep |
| --- | --- | --- |
| 1 · A01, copy the poem | In a named native viewer copy the verse from visible, alternate and raster PDFs. Compare clipboard text with extraction and rendered-page OCR. Test the booking footer in the same session. | Exact clipboard strings, line order, renderer and viewer versions. An empty selection, a faithful alternative and an instruction are separate results. [Two Poems](TWO-POEMS.md) |
| 2 · A01, rewrite the poem | Run the existing clone, Ghostscript rewrite and raster controls. Compare source/derivative hashes, decoded character maps, renders and extracted readings. Ask which operation preserves a second voice. | Keep the measured loss even if a later engine release restores it. [Transformation notebook](TRANSFORMATION-NOTEBOOK.md) · [minimal mapping](MAPPING-MINIMAL.md) |
| 3 · 07, switch the layers | Reuse all eight saved configurations and the existing Boolean truth table. Compare the same panel in each engine, then separately test one actual viewer toggle. | Record intended, painted and extracted states independently. The measured MuPDF disagreement is a versioned observation. Saved-state replay does not qualify live toggling. [Layer lock](WEIRD-MACHINES.md) |
| 4 · 04–06, identity, history and print | Compare the two interpretations of file 04. Inspect the older and current revisions of object 17 and the rewritten control. For 06, compare default screen view with a named viewer's print output. | Keep parser/operation, revision references and output bytes. A simulated print-state reading and a real print-to-PDF result need separate labels. [Cabinet evidence](evidence/cabinet-results.json) |
| 5 · 03, 08, 09, recovery and computation | For 03 compare each damaged fixture with baseline under each parser. For the bitmap circuit and colour function reuse the existing expected sampled values. | Record rejection, repair, timeout and divergent output individually. Sample the intended pixel regions rather than equating different full-page raster hashes across engines. [Existing checks](check-weird.py) |
| 6 · 02, interactive backstage | In a disposable viewer session test one button/state transition, with scripting settings recorded. | Distinguish an implemented simulator, supported native viewer action, blocked action and unchecked viewer. [Run notes](RUNNING.md) |

**First useful increment.** Add a clipboard observation to A01 before introducing a generic test runner. Preserve existing evidence JSON and checks. For a new observation record specimen hash, changed object, operation, instrument/version/settings, returned bytes or text, control, expectation and outcome. Compare within one instrument first. Give an unexpected result a reproducible case; do not make a known quirk a permanent expectation for every release.

**Second increment.** Put the existing deterministic transformation and layer checks behind one offline command. Keep browser clipboard/print and model trials opt-in. A CI check can require stable fixtures and complete evidence without requiring every renderer to agree. For the first model trial use the same booking question, fresh sessions, paired seeds and blind scoring. Save request and output separately. A quoted instruction or wrong amount needs its own label. Do not infer a proprietary parser from a chatbot answer.

## Where to try it

| Purpose | Suggested boundary | Interpretation |
| --- | --- | --- |
| Play with our authored fixtures | Open them in a local viewer, or inspect the font and CMap in the [DocSpring browser debugger](https://docspring.com/tools/pdf-debugger). | Useful for structure; measure the actual clipboard independently. |
| Compare native text and OCR | Run [PhantomLint](https://github.com/tobycmurray/phantom-lint) with network disabled, a read-only specimen mount and a separate empty output directory. | A discrepancy can be benign. Preserve both readings. |
| Flatten an unfamiliar document | [Dangerzone](https://github.com/freedomofpress/dangerzone) renders to pixels in a networkless sandbox. Use a disposable offline VM if the original structure itself must be inspected. | The output is a derivative. Whether it erases the second poem is a proposed experiment. |
| Ask a model | The included runner uses an already installed loopback Ollama model with synthetic excerpts and no tools. | Measures local text ingestion. Hosted direct-PDF uploads, images and indexed retrieval need separate runs. |

## Prior art and evidence boundary

[Rao et al., figure 2](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0331871) found a review watermark after a custom embedded font showed readers a conference notice. [Luo et al.](https://eprint.iacr.org/2026/278.pdf) measured alternate machine readings through font and positioning changes. [Torrielli et al.](https://link.springer.com/article/10.1007/s11192-026-05695-x) documented invisible text rendering mode 3 in manuscript uploads. [Xiong et al.](https://aclanthology.org/2025.findings-emnlp.376/) tested malicious fonts and tool effects. [CrackedPDFs](https://github.com/volkthienpreecha/crackedpdfs) is a detector benchmark with a placement erratum. These are external results; none constitutes a compliance result for our fixtures.

For direct model input, [OpenAI](https://developers.openai.com/api/docs/guides/file-inputs), [Anthropic](https://platform.claude.com/docs/en/build-with-claude/pdf-support) and [Gemini](https://ai.google.dev/gemini-api/docs/document-processing) document routes that can provide both native text and page visuals. Record the actual route, model, settings and date. Internal arbitration remains unknown.

## Handoff

New finding: the booking fixture isolates a character-map change through local request assembly. Proposed first follow-up: measure actual clipboard behaviour, then transformation survival and layer state. Open questions: which native viewers preserve the alternate reading; when does flattening erase it; does a model act on it? No model, Firefox clipboard or Dangerzone result is claimed. The suite ordering is proposed for review.
