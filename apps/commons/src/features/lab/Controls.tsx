import { Badge, Chip } from "../../components/aurora/Primitives";
import { LabIcon, type LabIconName } from "./LabIcon";
import { specimen, type GeneratedReading, type Specimen } from "./model";
import { views, type LabSearch, type labState } from "./state";
export type State = ReturnType<typeof labState>;
export type Update = (patch: Partial<LabSearch>) => void;
export function SpecimenPanel({
  state,
  update,
  generated,
}: {
  state: State;
  update: Update;
  generated?: GeneratedReading;
}) {
  return (
    <aside
      className="lp"
      aria-label="Proben und Leser"
      inert={state.focus || undefined}
    >
      <section className="box">
        <h6>Proben</h6>
        {(["a", "b", ...(generated ? (["meine"] as const) : [])] as const).map(
          (id) => {
            const s = specimen(id, state.reader, generated);
            return (
              <button
                type="button"
                key={id}
                className={`spec ${state.probe === id ? "on gb" : ""}`}
                aria-pressed={state.probe === id}
                onClick={() => update({ probe: id })}
              >
                <span className="thumb" />
                <span>
                  {s.name}
                  <small>
                    {s.generated
                      ? "neu erzeugt · nicht gemessen"
                      : `${s.file} · 1 Seite`}
                  </small>
                </span>
              </button>
            );
          },
        )}
      </section>
      <section className="box">
        <h6>Leser</h6>
        {(["pdftotext", "mupdf"] as const).map((reader) => {
          const s = specimen(state.probe, reader, generated);
          return (
            <label key={reader} className="reader">
              <input
                type="radio"
                name="lab-reader"
                checked={state.reader === reader}
                onChange={() => update({ leser: reader })}
              />
              {reader === "mupdf" ? "MuPDF" : "pdftotext"}
              <span className="r">
                {s.run ? (
                  <Badge tone="ok">gemessen</Badge>
                ) : (
                  <Chip>nicht gemessen</Chip>
                )}
              </span>
            </label>
          );
        })}
        <label className="reader">
          <input type="radio" name="lab-reader" disabled />
          OCR
          <span className="r">
            <Chip>nicht gemessen</Chip>
          </span>
        </label>
      </section>
      <section className="box">
        <h6>Was ist hier anders?</h6>
        <p className="hint">
          Beide Dateien sehen gleich aus. Ihre Zeichenzuordnung unterscheidet
          sich. Ein Textleser liest diese Zuordnung.
        </p>
      </section>
    </aside>
  );
}
const labels = ["Seite", "Text", "Zeichen", "Struktur"];
const icons: LabIconName[] = ["page", "text", "glyph", "tree"];
export function StageBar({
  state,
  update,
  xray,
}: {
  state: State;
  update: Update;
  xray: number;
}) {
  return (
    <div className="stagebar">
      <nav className="seg" aria-label="Ansicht">
        {views.map((view, i) => (
          <button
            type="button"
            key={view}
            className={state.view === view ? "on" : ""}
            aria-pressed={state.view === view}
            onClick={() => update({ ansicht: view })}
            title={`Ansicht · ${i + 1}`}
          >
            <LabIcon name={icons[i]} />
            {labels[i]}
          </button>
        ))}
      </nav>
      <label className="xray">
        Durchsicht
        <input
          aria-label="Durchsicht"
          type="range"
          min="0"
          max="100"
          value={xray}
          onChange={(e) =>
            update({ ansicht: "seite", durchsicht: Number(e.target.value) })
          }
        />
        <b>{Math.round(xray)}%</b>
      </label>
    </div>
  );
}
export function FloatingToolbar({
  state,
  update,
  reveal,
  reset,
}: {
  state: State;
  update: Update;
  reveal: () => void;
  reset: () => void;
}) {
  return (
    <div className="floatbar" role="toolbar" aria-label="Bühne">
      <button type="button" className="tbtn primary" onClick={reveal}>
        <LabIcon name="eye" />
        Andere Lesart zeigen<kbd className="k">R</kbd>
      </button>
      <button
        type="button"
        className={`tbtn ${state.compare ? "on" : ""}`}
        aria-pressed={state.compare}
        onClick={() => update({ vergleich: state.compare ? undefined : 1 })}
      >
        <LabIcon name="compare" />
        Vergleichen<kbd className="k">V</kbd>
      </button>
      <span className="dv" />
      <button
        type="button"
        className="tbtn"
        aria-label="Verkleinern"
        disabled={state.zoom <= 60}
        onClick={() => update({ zoom: state.zoom - 10 })}
      >
        −
      </button>
      <span className="zv">{state.zoom}%</span>
      <button
        type="button"
        className="tbtn"
        aria-label="Vergrössern"
        disabled={state.zoom >= 160}
        onClick={() => update({ zoom: state.zoom + 10 })}
      >
        +
      </button>
      <span className="dv" />
      <button
        type="button"
        className="tbtn"
        aria-label="Zurücksetzen"
        title="Zurücksetzen (0)"
        onClick={reset}
      >
        <LabIcon name="reset" />
      </button>
    </div>
  );
}
export function ToolRail({
  state,
  update,
  recipe,
  chat,
  measure,
}: {
  state: State;
  update: Update;
  recipe: () => void;
  chat: () => void;
  measure: () => void;
}) {
  const tool = (
    icon: LabIconName,
    label: string,
    action: () => void,
    active = false,
  ) => (
    <button
      type="button"
      className={`tool ${active ? "on gb" : ""}`}
      aria-label={label}
      title={label}
      onClick={action}
    >
      <LabIcon name={icon} />
    </button>
  );
  return (
    <nav className="rail" aria-label="Werkzeuge">
      {tool(
        "cursor",
        "Zeile auswählen · Pfeiltasten",
        () => update({ ansicht: "seite" }),
        state.view === "seite",
      )}
      {tool("zoom", "Lupe", () =>
        update({
          zoom: state.zoom === 160 ? 100 : Math.min(160, state.zoom + 20),
        }),
      )}
      {tool(
        "compare",
        "Lesarten vergleichen · V",
        () => update({ vergleich: state.compare ? undefined : 1 }),
        state.compare,
      )}
      {tool("flask", "Eigene Lesart schreiben", recipe)}
      {tool("ruler", "Gespeicherte Messung ansehen", measure)}
      <div className="spacer" />
      {tool(
        "focus",
        "Fokus auf das Dokument · F",
        () => update({ fokus: state.focus ? undefined : 1 }),
        state.focus,
      )}
      {tool("chat", "Gespräch · G", chat)}
    </nav>
  );
}
export function EvidenceStrip({
  selected,
  compare,
  original,
  bridge,
}: {
  selected: Specimen;
  compare: boolean;
  original?: string;
  bridge?: () => void;
}) {
  const run = selected.run;
  return (
    <footer className="foot" aria-label="Belegleiste">
      <span className={`st ${selected.generated || !run ? "gen" : ""}`}>
        <i />
        <span>
          {selected.generated
            ? "Neu erzeugt · nicht gemessen"
            : run
              ? "Gemessen"
              : "Nicht erfasst"}
        </span>
      </span>
      <span className="m">
        {selected.generated
          ? "meine-lesart.pdf · kein Leserlauf · Bezug: Gedicht A"
          : run
            ? `${run.instrument.wrapper} ${run.instrument.version ?? "Version nicht erfasst"} · Laufdatum nicht erfasst · ${compare ? "A ↔ " : ""}${selected.file}`
            : `${selected.file} · kein nutzbarer Leserlauf`}
      </span>
      {(original ?? selected.original) && (
        <a
          href={original ?? selected.original}
          download={selected.generated ? "meine-lesart.pdf" : undefined}
        >
          Original ansehen
        </a>
      )}
      {run && (
        <a href={`${import.meta.env.BASE_URL}lab/${run.evidence.path}`} target="_blank" rel="noreferrer">
          Beleg
        </a>
      )}
      {bridge && (
        <button
          type="button"
          className="btn btn-ghost-acc gb bridge"
          onClick={bridge}
        >
          Zur menschlichen Erfahrung
          <LabIcon name="arrow" />
        </button>
      )}
    </footer>
  );
}
