import { describe, expect, it } from "vitest";
import { clampCrop, cropFromDrag, nudgeCrop } from "@/lib/crop";
import { buildDeck, moveCard } from "@/lib/deck";
import { saveReference, setDraftFromPlate } from "@/lib/notes";
import { detourFor, plates } from "@/lib/samples";
import { searchPages } from "@/lib/search";
import {
  beforeYouGo,
  closeSession,
  dismissNudge,
  layoutTrail,
  nudgeTarget,
  recordSearch,
  savePlate,
  startSession,
  visitPlate,
} from "@/lib/tangents";

describe("tangents session", () => {
  it("keeps a plate with no typing, then counts a later note as a shift", () => {
    let state = startSession("Sample session", 1_000);
    state = visitPlate(state, "shell-section", undefined, 1_500);
    const again = visitPlate(state, "shell-section", undefined, 1_800);
    expect(again).toBe(state);
    expect(state.visits).toHaveLength(1);

    const saved = savePlate(state, "shell-section", "", "", 2_000);
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    expect(saved.state.shifts).toBe(0);
    expect(saved.state.saves["shell-section"].eye).toBe("");

    const edited = savePlate(saved.state, "shell-section", "", "The step between chambers", 3_000);
    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    expect(edited.state.shifts).toBe(1);
    expect(edited.state.saves["shell-section"].note).toContain("chambers");
  });

  it("offers one nudge only after a save, and a detour branches under its parent", () => {
    let state = startSession("Sample session", 1_000);
    state = visitPlate(state, "shell-section");
    expect(nudgeTarget(state)).toBeNull();
    const saved = savePlate(state, "shell-section", "The chamber wall", "");
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    state = saved.state;
    expect(nudgeTarget(state)?.id).toBe("shell-blue");

    state = dismissNudge(state);
    expect(nudgeTarget(state)).toBeNull();
    state = { ...state, nudgeDismissed: false };

    state = visitPlate(state, "shell-blue", { markNudge: true });
    expect(state.nudgeFollowed).toBe(true);
    expect(nudgeTarget(state)).toBeNull();
    const nodes = layoutTrail(state);
    const parent = nodes.find((node) => node.plateId === "shell-section");
    const child = nodes.find((node) => node.plateId === "shell-blue");
    expect(parent).toBeTruthy();
    expect(child).toBeTruthy();
    if (!parent || !child) return;
    expect(child.y).toBeGreaterThan(parent.y);
    expect(child.detour).toBe(true);
  });

  it("holds one untaken side path for before you go, then closes without erasing the trail", () => {
    let state = startSession("Cloth", 1_000);
    state = visitPlate(state, "kneeling-drape");
    expect(beforeYouGo(state)?.id).toBe("pleated-fan");
    state = visitPlate(state, "pleated-fan");
    expect(beforeYouGo(state)).toBeNull();
    const closed = closeSession(state, 9_000);
    expect(closed.endedAt).toBe(9_000);
    expect(closed.visits).toHaveLength(2);
    expect(closeSession(closed, 12_000)).toBe(closed);
  });
});

describe("sample search", () => {
  it("finds cloth pages for a drapery search and still returns pages for any other words", () => {
    const drapery = searchPages("drapery folds");
    expect(drapery.map((hit) => hit.plateId)).toContain("kneeling-drape");
    expect(drapery[0].displayUrl.startsWith("sample.page/")).toBe(true);
    expect(drapery[0].snippet.length).toBeGreaterThan(10);
    const fallback = searchPages("zzzz copper moon");
    expect(fallback.length).toBeGreaterThan(0);
    expect(fallback[0].snippet.toLowerCase()).toContain("zzzz");
  });

  it("records a search once until the words change", () => {
    let state = startSession("Sample session", 1_000);
    state = recordSearch(state, "  shell spiral ", 1_200);
    const again = recordSearch(state, "shell spiral", 1_300);
    expect(again).toBe(state);
    expect(state.searches).toHaveLength(1);
    state = recordSearch(state, "plaster cast", 1_400);
    expect(state.searches).toHaveLength(2);
  });
});

describe("sample library", () => {
  it("gives every main plate one real side path", () => {
    const mains = plates.filter((plate) => plate.kind === "main");
    expect(mains.length).toBeGreaterThanOrEqual(4);
    for (const plate of mains) {
      const detour = detourFor(plate.id);
      expect(detour?.kind).toBe("detour");
      expect(detour?.src.startsWith("/plates/")).toBe(true);
    }
  });
});

describe("reference notes", () => {
  it("refuses a save until the region, note, and source exist, then keeps them", () => {
    const draft = setDraftFromPlate("arm-hand");
    expect(draft?.title).toBe("Where the line slows");
    const base = { projectName: "Wall study", references: [], draft };
    const missing = saveReference(base, {
      plateId: "arm-hand",
      title: draft!.title,
      imageSrc: draft!.imageSrc,
      alt: draft!.alt,
      crop: null,
      note: "the knuckle",
      source: draft!.source,
    });
    expect(missing.ok).toBe(false);
    const saved = saveReference(base, {
      plateId: "arm-hand",
      title: draft!.title,
      imageSrc: draft!.imageSrc,
      alt: draft!.alt,
      crop: draft!.suggestedCrop,
      note: "The line slows at the knuckle.",
      source: draft!.source,
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    expect(saved.state.references[0].note).toContain("knuckle");
    expect(saved.state.references[0].crop.w).toBeGreaterThan(0);
    expect(saved.state.draft).toBeNull();
  });
});

describe("deck and crop", () => {
  it("clamps a region and moves cards without dropping one", () => {
    expect(clampCrop({ x: -10, y: 95, w: 4, h: 80 })).toEqual({ x: 0, y: 20, w: 8, h: 80 });
    const click = cropFromDrag(40, 40, 40.2, 40.2);
    expect(click.w).toBeGreaterThanOrEqual(8);
    expect(nudgeCrop({ x: 10, y: 10, w: 20, h: 20 }, 5, 0).x).toBe(15);

    const deck = buildDeck([], ["shell-section", "pleated-fan"], []);
    expect(deck).toHaveLength(2);
    const moved = moveCard(deck, 0, 1);
    expect(moved[0].plateId).toBe("pleated-fan");
    expect(moved[1].plateId).toBe("shell-section");
    expect(moveCard(moved, 0, -1)).toBe(moved);
  });
});
