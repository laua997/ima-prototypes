"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CroppedImage } from "@/components/cropped-image";
import { PlateImage } from "@/components/plate-image";
import { Opening, TangentsFrame } from "@/components/tangents/frame";
import { Nudge } from "@/components/tangents/nudge";
import { useRequiredSession } from "@/components/tangents/use-tangents";
import { Button } from "@/components/ui/button";
import { getPlate } from "@/lib/samples";
import {
  CARD_H,
  CARD_W,
  canvasSize,
  dismissNudge,
  layoutTrail,
  nudgeTarget,
  pencilPath,
  sessionStats,
  visitPlate,
} from "@/lib/tangents";
import { hashSeed } from "@/lib/utils";

export function MapScreen() {
  const { value, commit, ready, reset } = useRequiredSession();
  const router = useRouter();
  const [mode, setMode] = useState<"map" | "timeline">("map");
  const [zoom, setZoom] = useState(1);
  const [now, setNow] = useState(() => Date.now());
  const [handOn, setHandOn] = useState(false);
  const [spacePan, setSpacePan] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const hand = handOn || spacePan;

  useEffect(() => {
    if (mode !== "map") return;
    const el = scrollerRef.current;
    if (!el) return;
    const frame = window.requestAnimationFrame(() => {
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
      el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode, value.visits.length]);

  useEffect(() => {
    if (!ready || !value.startedAt || value.endedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ready, value.endedAt, value.startedAt]);

  useEffect(() => {
    function down(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement;
      if (event.code === "Space" && !event.repeat && !typing) {
        event.preventDefault();
        setSpacePan(true);
      }
    }
    function up(event: KeyboardEvent) {
      if (event.code === "Space") setSpacePan(false);
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function backToCenter() {
    setZoom(1);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
        el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
      });
    });
  }

  if (!ready || !value.startedAt) {
    return (
      <TangentsFrame onReset={reset}>
        <Opening />
      </TangentsFrame>
    );
  }

  const nudge = nudgeTarget(value);
  const nodes = layoutTrail(value);
  const size = canvasSize(nodes);
  const stats = sessionStats(value, now);
  const mains = nodes.filter((node) => !node.detour);

  return (
    <TangentsFrame state={value} onReset={reset} glow>
      {nudge ? (
        <Nudge
          plate={nudge}
          onDismiss={() => commit(dismissNudge(value))}
          onBranch={() => {
            commit(visitPlate(value, nudge.id, { markNudge: true }));
            router.push(`/tangents/plate/${nudge.id}`);
          }}
        />
      ) : null}
      <div className="flex min-h-[calc(100vh-7rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex rounded-full bg-white p-1 text-sm shadow-sm" role="group" aria-label="How to view the pages you opened">
            <button
              type="button"
              className={mode === "timeline" ? "rounded-full bg-[#1c1915] px-3 py-1 text-[#f6f1e6]" : "rounded-full px-3 py-1"}
              aria-pressed={mode === "timeline"}
              onClick={() => setMode("timeline")}
            >
              List
            </button>
            <button
              type="button"
              className={mode === "map" ? "rounded-full bg-[#1c1915] px-3 py-1 text-[#f6f1e6]" : "rounded-full px-3 py-1"}
              aria-pressed={mode === "map"}
              onClick={() => setMode("map")}
            >
              Map
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mode === "map" ? (
              <>
                <button
                  type="button"
                  id="hand-tool"
                  aria-pressed={handOn}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${handOn ? "bg-[#1c1915] text-[#f6f1e6]" : "bg-white"}`}
                  onClick={() => setHandOn((on) => !on)}
                >
                  <HandIcon />
                  Hand
                </button>
                <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm" aria-label="Zoom">
                  <button type="button" className="size-8 rounded-full hover:bg-[#f3efe6]" onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))} aria-label="Zoom out">
                    −
                  </button>
                  <span className="w-12 text-center font-grotesk text-xs">{Math.round(zoom * 100)}%</span>
                  <button type="button" className="size-8 rounded-full hover:bg-[#f3efe6]" onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))} aria-label="Zoom in">
                    +
                  </button>
                  <button type="button" id="back-to-center" className="rounded-full px-2 py-1 text-xs hover:bg-[#f3efe6]" onClick={backToCenter}>
                    Back to center
                  </button>
                </div>
                <p className="text-sm text-[#3f3a34]">Hold space to drag the map.</p>
              </>
            ) : null}
            <Button variant="quiet" size="sm" asChild>
              <Link href="/tangents/before">Finish browsing</Link>
            </Button>
          </div>
        </div>

        {mode === "timeline" ? (
          <ol className="mx-auto w-full max-w-xl space-y-4 px-4 py-8 md:px-6">
            {value.visits.length === 0 ? (
              <li>
                You have not opened any pictures yet. <Link href="/tangents/field" className="underline">Go back to the pictures.</Link>
              </li>
            ) : (
              value.visits.map((visit) => {
                const plate = getPlate(visit.plateId);
                if (!plate) return null;
                const saved = value.saves[plate.id];
                return (
                  <li key={visit.id} className={visit.via === "detour" ? "ml-8 border-l border-[#b85a70] pl-4" : "border-l border-[#1c1915]/30 pl-4"}>
                    <Link href={`/tangents/plate/${plate.id}`} className="block text-left">
                      <span className="font-grotesk text-xs tracking-[0.14em] uppercase">{visit.via === "detour" ? "Other picture" : "Opened"}</span>
                      <span className="mt-1 block text-lg">{plate.title}</span>
                      <span className="mt-1 block text-sm text-[#3f3a34]">{saved?.note ? saved.note : saved ? "Saved" : "Opened, not saved."}</span>
                    </Link>
                  </li>
                );
              })
            )}
          </ol>
        ) : (
          <div
            ref={scrollerRef}
            id="map-canvas"
            className="relative h-[70vh] max-h-[70vh] min-h-[70vh] w-full shrink-0 overflow-auto"
            style={{ cursor: grabbing ? "grabbing" : hand ? "grab" : "auto", touchAction: hand ? "none" : "auto" }}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && !hand) return;
              const el = scrollerRef.current;
              if (!el) return;
              panRef.current = { x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
            }}
            onPointerMove={(event) => {
              const pan = panRef.current;
              const el = scrollerRef.current;
              if (!pan || !el) return;
              const dx = event.clientX - pan.x;
              const dy = event.clientY - pan.y;
              if (!pan.moved && Math.hypot(dx, dy) < 6) return;
              if (!pan.moved) {
                pan.moved = true;
                el.setPointerCapture(event.pointerId);
                setGrabbing(true);
              }
              el.scrollLeft = pan.left - dx;
              el.scrollTop = pan.top - dy;
            }}
            onClickCapture={(event) => {
              if (!suppressClick.current) return;
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }}
            onPointerUp={() => {
              if (panRef.current?.moved) {
                suppressClick.current = true;
                window.setTimeout(() => {
                  suppressClick.current = false;
                }, 0);
              }
              panRef.current = null;
              setGrabbing(false);
            }}
            onPointerCancel={() => {
              panRef.current = null;
              setGrabbing(false);
            }}
          >
            {nodes.length === 0 ? (
              <p className="px-6 py-24 text-lg">
                You have not opened any pictures yet. <Link href="/tangents/field" className="underline decoration-[#e2b340] underline-offset-4">Go back to the pictures.</Link>
              </p>
            ) : (
              <>
              {value.searches.length ? (
                <div className="mb-6 flex flex-wrap gap-3">
                  {value.searches.map((search) => (
                    <Link
                      key={search.id}
                      href={`/tangents/search?q=${encodeURIComponent(search.query)}`}
                      className="bg-white px-3 py-2 text-left shadow-sm"
                    >
                      <span className="font-grotesk text-[10px] tracking-[0.14em] uppercase">Search</span>
                      <span className="mt-1 block text-sm">{search.query}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              <div style={{ width: size.width * zoom, height: size.height * zoom, margin: 360 }}>
                <div className="relative" style={{ width: size.width, height: size.height, transform: `scale(${zoom})`, transformOrigin: "top left" }}>
                  <svg className="pointer-events-none absolute inset-0" width={size.width} height={size.height} aria-hidden="true">
                    {mains.slice(1).map((node, index) => {
                      const previous = mains[index];
                      return (
                        <path
                          key={`${previous.plateId}-${node.plateId}`}
                          d={pencilPath(previous.x + CARD_W / 2, previous.y + 70, node.x, node.y + 70, hashSeed(node.plateId))}
                          fill="none"
                          stroke="#2a261f"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {nodes
                      .filter((node) => node.detour)
                      .map((node) => {
                        const plate = getPlate(node.plateId);
                        const parent = nodes.find((item) => item.plateId === plate?.detourOf);
                        if (!parent) return null;
                        return (
                          <path
                            key={node.plateId}
                            d={pencilPath(parent.x + CARD_W / 2, parent.y + 150, node.x + CARD_W / 2, node.y + 20, hashSeed(node.plateId), 1.8)}
                            fill="none"
                            stroke="#b85a70"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        );
                      })}
                  </svg>
                  {nodes.map((node) => {
                    const plate = getPlate(node.plateId);
                    if (!plate) return null;
                    const saved = value.saves[plate.id];
                    const shot = [...value.shots].reverse().find((item) => item.plateId === plate.id);
                    return (
                      <Link
                        key={node.plateId}
                        href={`/tangents/plate/${plate.id}`}
                        className="absolute z-10 bg-white p-2 text-left shadow-[0_10px_24px_rgba(40,32,20,0.08)]"
                        style={{ left: node.x, top: node.y, width: CARD_W, minHeight: CARD_H }}
                        onClick={(event) => {
                          if (suppressClick.current) {
                            event.preventDefault();
                            suppressClick.current = false;
                          }
                        }}
                      >
                        {shot ? <CroppedImage src={plate.src} alt="" crop={shot.crop} className="max-h-28" /> : <PlateImage src={plate.src} alt="" className="aspect-[4/3] w-full object-cover" />}
                        {shot ? <span className="mt-2 block text-xs leading-snug">{shot.caption}</span> : null}
                        <span className="mt-2 flex items-center gap-2 font-grotesk text-[10px] tracking-[0.14em] uppercase">
                          <span className="size-1.5 rounded-full" style={{ background: node.detour ? "#b85a70" : "#6e8b5a" }} aria-hidden="true" />
                          {node.detour ? "Other picture" : plate.clusterLabel}
                          {saved ? <span className="ml-auto size-2 bg-[#e2b340]" aria-hidden="true" /> : null}
                        </span>
                        <span className="mt-1 block text-sm leading-snug">{plate.title}</span>
                        <span className="sr-only">{saved ? "Saved." : "Opened, not saved."}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-end gap-6">
            <ul className="font-grotesk text-xs leading-relaxed">
              <li>Time {stats.time}</li>
              <li>Pages opened {stats.stops}</li>
              <li>Searches {stats.searches}</li>
              <li>Saved {stats.saved}</li>
              <li>Other pictures {stats.detours}</li>
              <li>Notes edited {stats.shifts}</li>
            </ul>
          </div>
        </div>
      </div>
    </TangentsFrame>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 11V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 10.5V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 11V7.5a1.5 1.5 0 0 1 3 0V13" />
      <path d="M8 11.5c0 0-1.2-.8-2.2.4C4.6 13.3 6 16 8.2 17.6 10 19 12.2 20 15 20c2.8 0 4.5-1.4 4.5-3.5V12a1.5 1.5 0 0 0-3 0" />
    </svg>
  );
}
