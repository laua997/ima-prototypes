"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CroppedImage } from "@/components/cropped-image";
import { PlateImage } from "@/components/plate-image";
import { Opening, TangentsFrame } from "@/components/tangents/frame";
import { Nudge } from "@/components/tangents/nudge";
import { PageShot } from "@/components/tangents/page-shot";
import { SidePanel } from "@/components/tangents/side-panel";
import { useTangents } from "@/components/tangents/use-tangents";
import { Button } from "@/components/ui/button";
import { getPlate, mainPlates } from "@/lib/samples";
import type { Crop } from "@/lib/crop";
import { addShot, dismissNudge, nudgeTarget, visitPlate } from "@/lib/tangents";

export function Studio({ plateId }: { plateId?: string }) {
  const plate = getPlate(plateId ?? "shell-section") ?? mainPlates()[0];
  const { value, commit, ready, reset } = useTangents();
  const router = useRouter();
  const [shooting, setShooting] = useState(false);
  const [pending, setPending] = useState<Crop | null>(null);
  const [caption, setCaption] = useState("");
  const [shotError, setShotError] = useState("");

  useEffect(() => {
    if (!ready || !value.startedAt || !plate) return;
    const next = visitPlate(value, plate.id);
    if (next !== value) commit(next);
  }, [commit, plate, ready, value]);

  if (!ready || !plate) {
    return (
      <TangentsFrame onReset={reset}>
        <Opening />
      </TangentsFrame>
    );
  }

  const nudge = value.startedAt ? nudgeTarget(value) : null;

  return (
    <TangentsFrame state={value.startedAt ? value : undefined} onReset={reset}>
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
      <div className="flex min-h-[calc(100vh-7rem)] flex-col md:flex-row">
        <section className="min-w-0 flex-1 px-4 py-4 md:px-8" aria-label="Sample reference">
          <p className="font-grotesk text-xs tracking-[0.16em] uppercase">{plate.clusterLabel}</p>
          <h1 className="mt-1 font-grotesk text-3xl font-medium tracking-tight">{plate.title}</h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-[#3f3a34]">{plate.looking}</p>
          <div className="relative mt-4">
            <PlateImage
              src={plate.src}
              alt={plate.alt}
              className="max-h-[62vh] w-full bg-white object-contain shadow-[0_16px_40px_rgba(40,32,20,0.06)]"
            />
            {shooting ? (
              <PageShot
                onCancel={() => setShooting(false)}
                onPick={(next) => {
                  setPending(next);
                  setShooting(false);
                  setCaption("");
                  setShotError("");
                }}
              />
            ) : null}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3f3a34]">
            Sample picture. {plate.credit}{" "}
            <a className="underline decoration-[#e2b340] underline-offset-4" href={plate.sourceUrl} target="_blank" rel="noreferrer">
              Source
            </a>
          </p>
          <ul className="mt-6 flex gap-3 overflow-x-auto pb-2" aria-label="Other sample pictures">
            {mainPlates().map((item) => (
              <li key={item.id}>
                <Link
                  href={`/tangents/plate/${item.id}`}
                  className={`block w-28 bg-white p-1 ${item.id === plate.id ? "outline outline-2 outline-[#1c1915]" : ""}`}
                  aria-current={item.id === plate.id ? "true" : undefined}
                >
                  <PlateImage src={item.src} alt="" className="aspect-[4/3] w-full object-cover" />
                  <span className="mt-1 block truncate text-xs">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <SidePanel
          plate={plate}
          onShot={
            value.startedAt
              ? () => {
                  setShooting(true);
                  setPending(null);
                }
              : undefined
          }
        />
      </div>
      {pending ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1c1915]/50 p-4 sm:items-center" onMouseDown={() => setPending(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="caption-title"
            className="w-full max-w-lg bg-[#f7f1e8] p-4 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="caption-title" className="font-grotesk text-xl">
              What did you like about this?
            </h2>
            <CroppedImage src={plate.src} alt="" crop={pending} className="mt-3 max-h-64" />
            <label htmlFor="caption" className="sr-only">
              What did you like about this?
            </label>
            <textarea
              id="caption"
              value={caption}
              rows={4}
              onChange={(event) => setCaption(event.target.value)}
              className="mt-3 w-full border border-[#1c1915]/20 bg-white p-3 text-base"
            />
            {shotError ? (
              <p role="alert" className="mt-2 text-sm">
                {shotError}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                id="save-caption"
                variant="vermilion"
                onClick={() => {
                  if (!caption.trim()) {
                    setShotError("Write what you liked about it.");
                    return;
                  }
                  const next = addShot(value, plate.id, pending, caption);
                  if (next === value) return;
                  commit(next);
                  setPending(null);
                }}
              >
                Save
              </Button>
              <Button type="button" variant="quiet" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </TangentsFrame>
  );
}
