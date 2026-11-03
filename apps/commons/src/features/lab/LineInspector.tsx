import { Badge } from "../../components/aurora/Primitives";
import {
  contentExcerpt,
  drawnLines,
  mappedLine,
  measuredLine,
  type Specimen,
} from "./model";
import { DiffText } from "./Sheet";
export function LineInspector({
  specimen: s,
  line,
  rawOpen,
  onRaw,
}: {
  specimen: Specimen;
  line: number;
  rawOpen: boolean;
  onRaw: (open: boolean) => void;
}) {
  const drawn = drawnLines()[line] ?? "nicht erfasst";
  const mapped = mappedLine(s, line);
  const measured = measuredLine(s, line);
  const glyph =
    s.fixture?.kind === "type3-mapped" ? s.fixture.lines[line] : undefined;
  const different = mapped !== null && mapped !== drawn;
  return (
    <section className="box" aria-label="Inspektor der ausgewählten Zeile">
      <h6>
        Diese Stelle <Badge tone="acc">Zeile {line + 1}</Badge>
      </h6>
      <div className="chain" key={`${s.id}:${line}`}>
        <div className="step">
          <span className="k">1</span>
          <div>
            <div className="lbl">Gezeichnet</div>
            <div className="val serif">{drawn}</div>
          </div>
        </div>
        <div className="step">
          <span className="k">2</span>
          <div>
            <div className="lbl">Zeichen · ganze Zeile</div>
            <div className="val mono">
              {glyph
                ? `<${glyph.code}> · /${glyph.glyphName} · Objekt ${glyph.charProcObject}`
                : "nicht erfasst"}
            </div>
            <p className="glyph-limit">
              Buchstaben-IDs und Einzelkästen: nicht erfasst. Eine Type-3-Glyphe
              zeichnet hier die ganze Zeile.
            </p>
          </div>
        </div>
        <div className="step">
          <span className="k">3</span>
          <div>
            <div className="lbl">
              Zuordnung{" "}
              <Badge tone={different ? "warn" : "ok"}>
                {different ? "abweichend" : "unverändert"}
              </Badge>
            </div>
            {glyph ? (
              <table className="map">
                <caption className="sr-only">
                  Reale Zeichenzuordnung der Zeilenglyphe
                </caption>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Gezeichnet</th>
                    <th>Zugeordnet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>&lt;{glyph.code}&gt;</td>
                    <td>{drawn}</td>
                    <td>
                      <DiffText drawn={drawn} read={glyph.mapped} />
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="val">nicht erfasst</p>
            )}
          </div>
        </div>
        <div className="step">
          <span className="k">4</span>
          <div>
            <div className="lbl">Gelesen · {s.name}</div>
            <div className="val mono">
              {measured ? (
                <DiffText drawn={drawn} read={measured} />
              ) : s.generated ? (
                "Noch kein Leserlauf · nicht gemessen"
              ) : (
                "nicht erfasst"
              )}
            </div>
            {s.run?.instrument.wrapper === "pdftotext" && (
              <p className="glyph-limit">
                Textauszug · Zeilenanordnung im Originalauszug abweichend
              </p>
            )}
            <details
              open={rawOpen}
              onToggle={(e) => onRaw(e.currentTarget.open)}
            >
              <summary>Rohdaten</summary>
              <pre>{contentExcerpt(s, line)}</pre>
              <p className="glyph-limit">
                Auswahlrahmen: Position + deklarierte FontBBox, keine
                vermessenen Buchstaben.
              </p>
              {s.run && (
                <>
                  <h6>Gespeicherter Leserlauf</h6>
                  <pre>
                    {JSON.stringify(
                      {
                        instrument: s.run.instrument,
                        inputSha256: s.run.inputSha256,
                        command: s.run.command,
                        exitCode: s.run.exitCode,
                        limits: s.run.limits,
                        runDate: "nicht erfasst",
                      },
                      null,
                      2,
                    )}
                  </pre>
                  <pre>{s.run.text}</pre>
                  <p className="glyph-limit">stderr</p>
                  <pre>{s.run.stderr || "(leer)"}</pre>
                </>
              )}
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
