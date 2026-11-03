import type { CSSProperties } from "react";
import { Badge, Chip } from "../../components/aurora/Primitives";
import { drawnLines, mappedLine, measuredLine, type Specimen } from "./model";
import type { LabView } from "./state";

/** Longest-common-subsequence word diff. Mark only words absent from the drawn sequence. */
export function diffWords(
  drawn: string,
  read: string,
): Array<{ text: string; changed: boolean }> {
  const a = drawn.split(/\s+/),
    b = read.split(/\s+/);
  const lengths = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      lengths[i][j] =
        a[i] === b[j]
          ? 1 + lengths[i + 1][j + 1]
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
  const same = new Set<number>();
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) {
      same.add(j);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) i++;
    else j++;
  }
  return b.map((text, i) => ({ text, changed: !same.has(i) }));
}
export function DiffText({
  drawn,
  read,
  pulse = false,
}: {
  drawn: string;
  read: string;
  pulse?: boolean;
}) {
  return (
    <>
      {diffWords(drawn, read).map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          {word.changed ? (
            <mark className={pulse ? "pulse" : undefined}>{word.text}</mark>
          ) : (
            word.text
          )}
        </span>
      ))}
    </>
  );
}
type SheetProps = {
  specimen: Specimen;
  view: LabView;
  line: number;
  xray: number;
  compare: boolean;
  pulse: boolean;
  onSelect: (line: number) => void;
};
function reading(s: Specimen, line: number) {
  return s.generated ? mappedLine(s, line) : measuredLine(s, line);
}
export function Sheet({
  specimen: s,
  view,
  line,
  xray,
  compare,
  pulse,
  onSelect,
}: SheetProps) {
  const drawn = drawnLines();
  const realPage = view === "seite" || view === "zeichen";
  return (
    <article className="sheetwrap" aria-label={`${s.name} · ${view}`}>
      <div className="sheetlabel">
        <Chip>{s.file}</Chip>
        {s.generated ? (
          <Badge tone="warn">nicht gemessen</Badge>
        ) : s.run ? (
          <Badge tone="ok">gemessen</Badge>
        ) : (
          <Chip>nicht erfasst</Chip>
        )}
      </div>
      <div
        className={`sheet ${realPage ? "pdf-page" : "analysis-page"} ${view === "zeichen" ? "glyph-page" : ""}`}
      >
        {realPage ? (
          <>
            {s.preview ? (
              <img
                className="pdf-render"
                src={s.preview}
                alt={`${s.name} · gespeichertes MuPDF-Rendering${s.generated ? " der Ausgangsdatei" : ""}`}
                width="612"
                height="792"
              />
            ) : (
              <p className="missing">Rendering nicht erfasst</p>
            )}
            {drawn.map((text, i) => {
              const selection = s.selection(i);
              if (!selection) return null;
              const r = selection.region;
              const mapped = mappedLine(s, i);
              const extracted = reading(s, i);
              const glyph =
                s.fixture?.kind === "type3-mapped"
                  ? s.fixture.lines[i]
                  : undefined;
              const different = mapped !== null && mapped !== text;
              const style = {
                left: `${(100 * r.x) / r.pageWidth}%`,
                top: `${(100 * (r.pageHeight - r.y - r.height)) / r.pageHeight}%`,
                width: `${(100 * Math.min(r.width, r.pageWidth - r.x)) / r.pageWidth}%`,
                height: `${(100 * r.height) / r.pageHeight}%`,
                "--read-opacity": xray / 100,
              } as CSSProperties;
              const description = glyph
                ? `Code <${glyph.code}> · /${glyph.glyphName} → ${mapped}`
                : "Glyphendaten nicht erfasst";
              return (
                <button
                  type="button"
                  key={i}
                  className={`pdf-line ${line === i ? "is-sel" : ""} ${view === "zeichen" ? `g ${different ? "diff" : ""}` : ""}`}
                  style={style}
                  onClick={() => onSelect(i)}
                  aria-pressed={line === i}
                  aria-label={`Zeile ${i + 1}: ${text}${view === "zeichen" ? `. ${description}` : ""}`}
                  title={
                    view === "zeichen"
                      ? description
                      : `Zeile ${i + 1} untersuchen`
                  }
                >
                  <span className="no" aria-hidden="true">
                    {i + 1}
                  </span>
                  {view === "seite" && (
                    <span className="read-overlay">
                      {extracted ? (
                        <DiffText drawn={text} read={extracted} pulse={pulse} />
                      ) : (
                        "Leserlauf nicht erfasst"
                      )}
                    </span>
                  )}
                  {view === "zeichen" && line === i && (
                    <span className="glyph-code">
                      {glyph
                        ? `<${glyph.code}> · /${glyph.glyphName}`
                        : "nicht erfasst"}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : view === "text" ? (
          <>
            <h2 className="title">
              {s.generated ? "Zeichenzuordnung" : "Ausgelesener Text"}
            </h2>
            <div className="lines textsheet">
              {drawn.map((text, i) => (
                <button
                  type="button"
                  key={i}
                  className={`ln ${line === i ? "is-sel" : ""}`}
                  onClick={() => onSelect(i)}
                  aria-pressed={line === i}
                  aria-label={`Zeile ${i + 1} auswählen`}
                >
                  <span className="no" aria-hidden="true">
                    {i + 1}
                  </span>
                  {reading(s, i) ? (
                    <DiffText
                      drawn={text}
                      read={reading(s, i)!}
                      pulse={pulse}
                    />
                  ) : (
                    "nicht erfasst"
                  )}
                </button>
              ))}
            </div>
            <p className="page-note">
              {s.generated
                ? "Vorschau der Zuordnung · noch nicht ausgelesen"
                : "Gemessene Textauszüge, nach den vier Zeilen angeordnet. Originale Reihenfolge unter „Rohdaten“."}
            </p>
          </>
        ) : (
          <StructureView specimen={s} line={line} onSelect={onSelect} />
        )}
      </div>
      <p className="sheet-note">
        {view === "zeichen"
          ? "Eine Glyphe zeichnet eine ganze Zeile. Buchstaben-IDs und Einzelkästen: nicht erfasst."
          : s.generated
            ? "Referenzbild: Gedicht A · nur ToUnicode geändert"
            : realPage
              ? "Gespeichertes MuPDF-Bild · Auswahlrahmen aus deklarierten Schriftgrenzen"
              : s.run
                ? `${s.run.instrument.wrapper} ${s.run.instrument.version ?? "Version nicht erfasst"}`
                : "Leserlauf nicht erfasst"}
      </p>
      {compare && (
        <div className="readstrip">
          <b>
            {s.generated
              ? "Zuordnung · nicht gemessen"
              : `Gelesen · ${s.run?.instrument.wrapper ?? "nicht erfasst"}`}
          </b>
          {drawn.map((text, i) => (
            <button
              type="button"
              key={i}
              className={`ln ${line === i ? "is-sel" : ""}`}
              onClick={() => onSelect(i)}
              aria-pressed={line === i}
            >
              {reading(s, i) ? (
                <DiffText drawn={text} read={reading(s, i)!} />
              ) : (
                "nicht erfasst"
              )}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
function StructureView({
  specimen: s,
  line,
  onSelect,
}: {
  specimen: Specimen;
  line: number;
  onSelect: (line: number) => void;
}) {
  const fx = s.fixture;
  if (fx?.kind !== "type3-mapped")
    return <p className="missing">Strukturdaten nicht erfasst</p>;
  return (
    <div className="tree">
      <div className="n lvl0">
        Seite 1 <small>612 × 792 pt</small>
      </div>
      <div className="n">
        Schrift /G <small>Type 3 · Objekt {fx.fontObject}</small>
      </div>
      <div className="n">
        <code>ToUnicode</code>
        <small>Objekt {fx.toUnicodeObject}</small>
      </div>
      <div className="n">
        Inhaltsstrom <small>Objekt {fx.contentObject}</small>
      </div>
      {fx.lines.map((l, i) => (
        <div key={l.code}>
          <button
            type="button"
            className={`n lvl2 ${line === i ? "is-sel" : ""}`}
            onClick={() => onSelect(i)}
            aria-pressed={line === i}
          >
            Zeile {i + 1}
            <small>1 Glyphe · &lt;{l.code}&gt;</small>
          </button>
          {line === i && (
            <div className="n lvl3">
              <code>/{l.glyphName}</code>
              <small>Objekt {l.charProcObject}</small>
            </div>
          )}
        </div>
      ))}
      <p className="page-note">
        Aus den Objektverweisen und Zeichenpositionen. Semantische
        Textblock-Tags: nicht erfasst.
      </p>
    </div>
  );
}
