import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LabIcons } from "./LabIcon";
import { specimen } from "./model";
import type { LabSearch } from "./state";
import { Sheet } from "./Sheet";
import {
  SpecimenPanel,
  StageBar,
  FloatingToolbar,
  EvidenceStrip,
  ToolRail,
} from "./Controls";
import "./workbench.css";
import "./RealPage.css";
import "@fontsource/newsreader/latin-400.css";
import { LineInspector } from "./LineInspector";
import { RecipeEditor } from "./RecipeEditor";
import { useGenerated } from "./useGenerated";
import { useWorkbench } from "./useWorkbench";
import { AssistantDock, BridgeOverlay } from "./Overlays";
export function Workbench({ search }: { search: LabSearch }) {
  const {
    state,
    root,
    dock,
    setDock,
    bridge,
    setBridge,
    rawOpen,
    setRawOpen,
    update,
    reset,
    resetNotice,
    reveal,
    recipe,
    measure,
    xray,
    pulse,
  } = useWorkbench(search);
  const { generated, building, error, urls } = useGenerated(search.rezept);
  const [toast, setToast] = useState("");
  const notifyGeneration = useRef(false);
  useEffect(() => {
    if (!generated || !notifyGeneration.current) return;
    notifyGeneration.current = false;
    setToast("meine-lesart.pdf erzeugt · noch nicht gemessen");
  }, [generated]);
  useEffect(() => {
    if (resetNotice) setToast("Demo zurückgesetzt");
  }, [resetNotice]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast, resetNotice]);
  const selected = specimen(
    state.compare && state.probe === "a" ? "b" : state.probe,
    state.reader,
    generated,
  );
  const specimens = state.compare
    ? [specimen("a", state.reader), selected]
    : [selected];
  return (
    <div className="lab-workbench" data-focus={state.focus} ref={root}>
      <LabIcons />
      <div className="wb">
        <ToolRail
          state={state}
          update={update}
          recipe={recipe}
          chat={() => setDock((open) => !open)}
          measure={measure}
        />
        <SpecimenPanel state={state} update={update} generated={generated} />
        <main id="main" className="stage" aria-label="PDF Lab · Dokumentbühne">
          <StageBar state={state} update={update} xray={xray} />
          <div
            className={`table ${state.compare ? "cmp" : ""}`}
            style={{ "--z": state.zoom / 100 } as CSSProperties}
            tabIndex={0}
            aria-label="Dokumentansicht"
          >
            {error && <p role="alert">{error}</p>}
            {state.probe === "meine" && !generated ? (
              <p role="status">
                {building
                  ? "Lesart wird wiederhergestellt …"
                  : "Keine erzeugte Lesart vorhanden. Ein vollständiges Rezept fehlt im Link."}
              </p>
            ) : (
              specimens.map((s) => (
                <Sheet
                  key={s.id}
                  specimen={s}
                  view={state.view}
                  line={state.line}
                  xray={xray}
                  compare={state.compare}
                  pulse={pulse}
                  onSelect={(line) => update({ zeile: line + 1 })}
                />
              ))
            )}
          </div>
          <FloatingToolbar
            state={state}
            update={update}
            reveal={reveal}
            reset={() => {
              setToast("");
              reset();
            }}
          />
        </main>
        <aside
          className="rp"
          aria-label="Inspektor und eigene Lesart"
          inert={state.focus || undefined}
        >
          <LineInspector
            specimen={selected}
            line={state.line}
            rawOpen={rawOpen}
            onRaw={setRawOpen}
          />
          <RecipeEditor
            recipe={search.rezept}
            urls={urls}
            onGenerated={(rezept) => {
              notifyGeneration.current = true;
              update({
                rezept,
                probe: "meine",
                ansicht: "text",
                vergleich: undefined,
              });
            }}
          />
        </aside>
        <EvidenceStrip
          selected={selected}
          compare={state.compare}
          original={selected.generated ? urls.pdf : undefined}
          bridge={() => setBridge(true)}
        />
      </div>
      <AssistantDock open={dock} close={() => setDock(false)} reveal={reveal} />
      <div className={`toast ${toast ? "on" : ""}`} role="status">
        {toast && (
          <>
            <i />
            {toast}
          </>
        )}
      </div>
      <BridgeOverlay open={bridge} close={() => setBridge(false)} />
    </div>
  );
}
