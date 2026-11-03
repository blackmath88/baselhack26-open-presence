import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "../../components/aurora/Primitives";
import { LabIcon } from "./LabIcon";
export function AssistantDock({
  open,
  close,
  reveal,
}: {
  open: boolean;
  close: () => void;
  reveal: () => void;
}) {
  return (
    <section
      className={`dock ${open ? "on" : ""}`}
      aria-label="Gespräch mit dem Assistenten"
      hidden={!open}
    >
      <div className="msg">
        <div className="who">
          <span className="av ai" />
          Assistent<time>jetzt</time>
        </div>
        <p>
          Lies diese vier Zeilen. Dann zeige ich dir, was ein Programm an
          derselben Stelle liest.
        </p>
      </div>
      <div className="acts">
        <Button variant="primary" onClick={reveal}>
          Andere Lesart zeigen
        </Button>
        <Button onClick={close}>Schliessen</Button>
      </div>
    </section>
  );
}
export function BridgeOverlay({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="bridgeov"
      aria-labelledby="lab-bridge-title"
      onCancel={close}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]',
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="bridgecard">
        <div className="eyebrow">Vom Dokument zur Erfahrung</div>
        <h2 id="lab-bridge-title">
          Was muss mitreisen, wenn eine KI für uns liest?
        </h2>
        <p>
          Eine Seite kann gleich aussehen und anders gelesen werden. Bei
          menschlicher Erfahrung zählt, wer etwas sagt, unter welchen
          Bedingungen und was später ergänzt wurde.
        </p>
        <div className="row">
          <Button onClick={close}>Zurück zur Werkbank</Button>
          <Link
            to="/canvas/$investigationId"
            params={{ investigationId: 'bilderrahmen-mac' }}
            search={{ von: 'lab' }}
            state={{ fromLab: true }}
            className="btn btn-acc"
          >
            Zur menschlichen Erfahrung
            <LabIcon name="arrow" />
          </Link>
        </div>
      </div>
    </dialog>
  );
}
