"use client";

import { useState } from "react";
import Link from "next/link";
import { useTangents } from "@/components/tangents/use-tangents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { detourFor, type SamplePlate } from "@/lib/samples";
import { savePlate, startSession } from "@/lib/tangents";

export function SidePanel({
  plate,
  onShot,
}: {
  plate?: SamplePlate | null;
  onShot?: () => void;
}) {
  const { value, commit } = useTangents();
  const [open, setOpen] = useState(true);
  const [noting, setNoting] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [syncedId, setSyncedId] = useState(plate?.id ?? "");

  if ((plate?.id ?? "") !== syncedId) {
    setSyncedId(plate?.id ?? "");
    setNote(plate ? value.saves[plate.id]?.note ?? "" : "");
    setNoting(false);
    setStatus("");
  }

  if (!open) {
    return (
      <button
        type="button"
        id="reopen-panel"
        className="fixed right-4 bottom-4 z-20 rounded-full bg-[#1c1915] px-4 py-2 text-sm text-[#f6f1e6] shadow-lg"
        onClick={() => setOpen(true)}
      >
        prototype
      </button>
    );
  }

  const saved = plate ? value.saves[plate.id] : undefined;
  const detour = plate ? detourFor(plate.id) : null;
  const latestSearch = value.searches[value.searches.length - 1];

  return (
    <aside className="w-full border-[#1c1915]/15 bg-[#fffcf8]/90 px-4 py-4 md:w-80 md:border-l" aria-label="Side panel">
      <div className="flex items-center justify-between gap-2">
        <p className="font-grotesk text-sm lowercase">prototype</p>
        <button type="button" className="text-sm underline-offset-4 hover:underline" onClick={() => setOpen(false)}>
          Collapse
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#3f3a34]">
        Sample of a browser side panel. It only tracks these sample searches and pages, not your other tabs.
      </p>
      {!value.startedAt ? (
        <Button type="button" className="mt-4 w-full" id="start-session" onClick={() => commit(startSession())}>
          Start
        </Button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="font-grotesk text-xs tracking-[0.14em] uppercase">
            {value.searches.length} searches · {value.visits.length} opened · {Object.keys(value.saves).length} saved
          </p>
          {latestSearch ? <p className="text-sm leading-relaxed">Last search: {latestSearch.query}</p> : null}
          {plate ? (
            <>
              <Button
                type="button"
                className="w-full"
                id="keep-plate"
                variant={saved ? "line" : "ink"}
                onClick={() => {
                  const result = savePlate(value, plate.id, saved?.eye ?? "", saved?.note ?? note);
                  if (!result.ok) return;
                  commit(result.state);
                  setStatus("Saved");
                }}
              >
                {saved ? "Saved" : "Save this page"}
              </Button>
              <p role="status" className="min-h-5 text-sm">
                {status}
              </p>
              {onShot ? (
                <Button type="button" id="take-screenshot" variant="vermilion" className="w-full" onClick={onShot}>
                  Take a screenshot
                </Button>
              ) : null}
              {noting ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const result = savePlate(value, plate.id, "", note);
                    if (!result.ok) return;
                    commit(result.state);
                    setStatus(note.trim() ? "Note saved" : "Saved");
                    setNoting(false);
                  }}
                >
                  <label htmlFor="note" className="font-grotesk text-xs tracking-[0.14em] uppercase">
                    Note
                  </label>
                  <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} className="mt-1" />
                  <Button type="submit" variant="line" className="mt-2" id="save-note">
                    Save note
                  </Button>
                </form>
              ) : (
                <button type="button" id="add-note" className="text-sm underline decoration-[#e2b340] underline-offset-4" onClick={() => setNoting(true)}>
                  {saved?.note ? "Edit note" : "Add note"}
                </button>
              )}
              {value.shots
                .filter((shot) => shot.plateId === plate.id)
                .slice(-2)
                .map((shot) => (
                  <p key={shot.id} className="text-sm leading-relaxed">
                    {shot.caption}
                  </p>
                ))}
              {detour ? (
                <p className="text-sm leading-relaxed">
                  Try another picture:{" "}
                  <Link href={`/tangents/plate/${detour.id}`} className="underline decoration-[#e2b340] underline-offset-4">
                    {detour.title}
                  </Link>
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-relaxed">Search, then open a page. Saving is one click on that page.</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="line" size="sm" asChild>
              <Link href="/tangents/map">See pages you opened</Link>
            </Button>
            <Button variant="quiet" size="sm" asChild>
              <Link href="/tangents/before">Finish browsing</Link>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
