import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { labState, views, type LabSearch } from "./state";
import { DOCK_FLAG, usePresenterReset } from "./presenterReset";
export function useWorkbench(search: LabSearch) {
  const state = labState(search);
  const navigate = useNavigate();
  const presenterReset = usePresenterReset();
  const resetPending = useLocation({ select: (location) => location.state.demoReset });
  const [resetNotice, setResetNotice] = useState(0);
  const lastZero = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState(false);
  const [bridge, setBridge] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [animatedXray, setAnimatedXray] = useState<number>();
  const [pulse, setPulse] = useState(false);
  const frame = useRef(0);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const stopAnimation = useCallback(() => {
    cancelAnimationFrame(frame.current);
    clearTimeout(pulseTimer.current);
    setAnimatedXray(undefined);
    setPulse(false);
  }, []);
  const update = useCallback(
    (patch: Partial<LabSearch>) => {
      stopAnimation();
      void navigate({
        to: "/lab",
        search: (current) => ({ ...current, ...patch }),
        replace: true,
      });
    },
    [navigate, stopAnimation],
  );
  const reset = useCallback(() => {
    stopAnimation();
    setDock(false);
    setBridge(false);
    setRawOpen(false);
    void navigate({ to: "/lab", search: {}, replace: true });
  }, [navigate, stopAnimation]);
  const reveal = useCallback(() => {
    stopAnimation();
    setDock(false);
    void navigate({
      to: "/lab",
      search: (current) => ({
        ...current,
        probe: current.probe === "meine" ? "meine" : "b",
        ansicht: current.ansicht === undefined ? undefined : "seite",
        durchsicht: 100,
      }),
      replace: true,
    });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimatedXray(0);
    const start = performance.now();
    const tick = (now: number) => {
      const amount = Math.min(100, (now - start) / 3.6);
      setAnimatedXray(amount);
      if (amount < 100) frame.current = requestAnimationFrame(tick);
      else {
        setAnimatedXray(undefined);
        setPulse(true);
        pulseTimer.current = setTimeout(() => setPulse(false), 1800);
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, [navigate, stopAnimation]);
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(pulseTimer.current);
    },
    [],
  );
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(DOCK_FLAG) === "1";
    } catch {
      /* Optional storage. */
    }
    if (!seen) {
      const timer = setTimeout(() => {
        setDock(true);
        try {
          sessionStorage.setItem(DOCK_FLAG, "1");
        } catch {
          /* Optional storage. */
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [resetNotice]);
  useEffect(() => {
    if (!resetPending) return;
    stopAnimation();
    setDock(false);
    setBridge(false);
    setRawOpen(false);
    setResetNotice((notice) => notice + 1);
    lastZero.current = null;
    // Consume the one-shot history marker so browser back cannot replay a reset.
    void navigate({
      to: "/lab", search: {}, replace: true,
      state: (previous) => ({ ...previous, demoReset: undefined }),
    });
  }, [resetPending, navigate, stopAnimation]);
  const recipe = () => {
    update({ fokus: undefined });
    requestAnimationFrame(() => {
      const section = root.current?.querySelector("#lab-recipe");
      section?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
      section?.querySelector("input")?.focus({ preventScroll: true });
    });
  };
  const measure = () => {
    update({ fokus: undefined });
    setRawOpen(true);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector(".chain details")
        ?.scrollIntoView({ block: "nearest" }),
    );
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBridge(false);
        setDock(false);
        return;
      }
      if (
        bridge ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest(
            'input,textarea,select,[contenteditable="true"]',
          ))
      )
        return;
      const key = event.key.toLowerCase();
      if (key === "arrowdown" || key === "arrowup") {
        event.preventDefault();
        update({
          zeile: Math.max(
            1,
            Math.min(4, state.line + (key === "arrowdown" ? 2 : 0)),
          ),
        });
      } else if (["1", "2", "3", "4"].includes(key))
        update({ ansicht: views[Number(key) - 1] });
      else if (key === "r") reveal();
      else if (key === "v")
        update({ vergleich: state.compare ? undefined : 1 });
      else if (key === "f") update({ fokus: state.focus ? undefined : 1 });
      else if (key === "g") setDock((open) => !open);
      else if (key === "0" && !event.repeat) {
        const now = performance.now();
        if (lastZero.current !== null && now - lastZero.current <= 2000) {
          lastZero.current = null;
          void presenterReset();
        } else {
          lastZero.current = now;
          reset();
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [bridge, state.line, state.compare, state.focus, update, reveal, reset, presenterReset]);
  return {
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
    xray: animatedXray ?? state.xray,
    pulse,
  };
}
