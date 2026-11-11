import type { Crop } from "@/lib/crop";
import { createId, formatElapsed } from "@/lib/utils";
import { detourFor, getPlate, type SamplePlate } from "@/lib/samples";

export type Consent = {
  trail: boolean;
  notes: boolean;
  nudges: boolean;
};

export type Visit = {
  id: string;
  plateId: string;
  at: number;
  via: "open" | "detour";
  fromPlateId?: string;
};

export type Save = {
  plateId: string;
  eye: string;
  note: string;
  updatedAt: number;
};

export type SearchRecord = {
  id: string;
  query: string;
  at: number;
};

export type PageShot = {
  id: string;
  plateId: string;
  crop: Crop;
  caption: string;
  at: number;
};

export type TangentsState = {
  startedAt: number | null;
  endedAt: number | null;
  sessionName: string;
  consent: Consent;
  visits: Visit[];
  saves: Record<string, Save>;
  searches: SearchRecord[];
  shots: PageShot[];
  nudgeDismissed: boolean;
  nudgeFollowed: boolean;
  shifts: number;
};

export const initialTangentsState: TangentsState = {
  startedAt: null,
  endedAt: null,
  sessionName: "Sample session",
  consent: { trail: false, notes: false, nudges: false },
  visits: [],
  saves: {},
  searches: [],
  shots: [],
  nudgeDismissed: false,
  nudgeFollowed: false,
  shifts: 0,
};

export function startSession(name = "Sample session", now = Date.now()): TangentsState {
  return {
    ...initialTangentsState,
    startedAt: now,
    sessionName: name.trim().slice(0, 48) || "Sample session",
    consent: { trail: true, notes: true, nudges: true },
  };
}

export function visitPlate(
  state: TangentsState,
  plateId: string,
  options?: { markNudge?: boolean },
  now = Date.now(),
): TangentsState {
  const plate = getPlate(plateId);
  if (!plate || !state.startedAt) return state;
  const nudgeFollowed = options?.markNudge ? true : state.nudgeFollowed;
  const already = state.visits.some((visit) => visit.plateId === plateId);
  if (already) {
    if (nudgeFollowed === state.nudgeFollowed) return state;
    return { ...state, nudgeFollowed };
  }
  const via = plate.kind === "detour" ? "detour" : "open";
  return {
    ...state,
    nudgeFollowed,
    visits: [
      ...state.visits,
      {
        id: createId("visit"),
        plateId,
        at: now,
        via,
        fromPlateId: plate.detourOf,
      },
    ],
  };
}

export type SaveResult =
  | { ok: true; state: TangentsState }
  | { ok: false; error: string; state: TangentsState };

export function savePlate(
  state: TangentsState,
  plateId: string,
  eye: string,
  note: string,
  now = Date.now(),
): SaveResult {
  const trimmedEye = eye.trim();
  const trimmedNote = note.trim();
  if (!getPlate(plateId) || !state.startedAt) {
    return { ok: false, error: "That picture is not in this sample.", state };
  }
  const previous = state.saves[plateId];
  const changed = previous && (previous.eye !== trimmedEye || previous.note !== trimmedNote);
  return {
    ok: true,
    state: {
      ...state,
      shifts: changed ? state.shifts + 1 : state.shifts,
      saves: {
        ...state.saves,
        [plateId]: { plateId, eye: trimmedEye, note: trimmedNote, updatedAt: now },
      },
    },
  };
}

export function recordSearch(state: TangentsState, query: string, now = Date.now()): TangentsState {
  const text = query.trim().replace(/\s+/g, " ").slice(0, 80);
  if (!text || !state.startedAt) return state;
  const last = state.searches[state.searches.length - 1];
  if (last && last.query.toLowerCase() === text.toLowerCase()) return state;
  return {
    ...state,
    searches: [...state.searches, { id: createId("search"), query: text, at: now }],
  };
}

export function addShot(state: TangentsState, plateId: string, crop: Crop, caption: string, now = Date.now()): TangentsState {
  const text = caption.trim();
  if (!text || !getPlate(plateId) || !state.startedAt) return state;
  return {
    ...state,
    shots: [...state.shots, { id: createId("shot"), plateId, crop, caption: text, at: now }],
  };
}

export function dismissNudge(state: TangentsState): TangentsState {
  if (state.nudgeDismissed) return state;
  return { ...state, nudgeDismissed: true };
}

export function closeSession(state: TangentsState, now = Date.now()): TangentsState {
  if (!state.startedAt || state.endedAt) return state;
  return { ...state, endedAt: now };
}

export function nudgeTarget(state: TangentsState): SamplePlate | null {
  if (!state.startedAt || state.endedAt || !state.consent.nudges) return null;
  if (state.nudgeDismissed || state.nudgeFollowed) return null;
  if (Object.keys(state.saves).length < 1) return null;
  const ordered = [...state.visits].reverse();
  for (const visit of ordered) {
    const plate = getPlate(visit.plateId);
    if (!plate || plate.kind === "detour") continue;
    const detour = detourFor(plate.id);
    if (detour && !state.visits.some((item) => item.plateId === detour.id)) return detour;
  }
  return null;
}

export function beforeYouGo(state: TangentsState): SamplePlate | null {
  for (const visit of state.visits) {
    const plate = getPlate(visit.plateId);
    if (!plate || plate.kind === "detour") continue;
    const detour = detourFor(plate.id);
    if (detour && !state.visits.some((item) => item.plateId === detour.id)) return detour;
  }
  return null;
}

export function sessionStats(state: TangentsState, now = Date.now()) {
  const end = state.endedAt ?? now;
  const elapsed = state.startedAt ? end - state.startedAt : 0;
  return {
    time: formatElapsed(elapsed),
    stops: state.visits.length,
    saved: Object.keys(state.saves).length,
    detours: state.visits.filter((visit) => visit.via === "detour").length,
    searches: state.searches.length,
    shots: state.shots.length,
    shifts: state.shifts,
  };
}

export type NodePos = {
  plateId: string;
  x: number;
  y: number;
  detour: boolean;
};

export const CARD_W = 176;
export const CARD_H = 228;

export function layoutTrail(state: TangentsState): NodePos[] {
  const mains = state.visits.filter((visit) => getPlate(visit.plateId)?.kind !== "detour");
  const detours = state.visits.filter((visit) => getPlate(visit.plateId)?.kind === "detour");
  const nodes: NodePos[] = mains.map((visit, index) => ({
    plateId: visit.plateId,
    x: 36 + index * 228,
    y: 64,
    detour: false,
  }));
  for (const visit of detours) {
    const plate = getPlate(visit.plateId);
    const parent = nodes.find((node) => node.plateId === plate?.detourOf);
    nodes.push({
      plateId: visit.plateId,
      x: parent ? parent.x + 28 : 36,
      y: parent ? parent.y + 268 : 340,
      detour: true,
    });
  }
  return nodes;
}

export function canvasSize(nodes: NodePos[]) {
  const maxX = nodes.reduce((max, node) => Math.max(max, node.x), 0);
  const maxY = nodes.reduce((max, node) => Math.max(max, node.y), 0);
  return {
    width: Math.max(880, maxX + CARD_W + 72),
    height: Math.max(520, maxY + CARD_H + 64),
  };
}

export function pencilPath(x1: number, y1: number, x2: number, y2: number, seed: number, wild = 1) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const a = ((seed % 5) - 2) * 10 * wild;
  const b = (((seed * 3) % 5) - 2) * 8 * wild;
  const c1x = x1 + dx * 0.35 + nx * a;
  const c1y = y1 + dy * 0.35 + ny * a;
  const c2x = x1 + dx * 0.68 + nx * b;
  const c2y = y1 + dy * 0.68 + ny * b;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function readSearches(value: unknown): SearchRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is SearchRecord =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.query === "string" &&
      typeof item.at === "number",
  );
}

function readShots(value: unknown): PageShot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const shot = item as PageShot;
    const crop = shot.crop;
    if (typeof shot.id !== "string" || typeof shot.plateId !== "string" || !getPlate(shot.plateId)) return [];
    if (typeof shot.caption !== "string" || typeof shot.at !== "number") return [];
    if (!crop || typeof crop.x !== "number" || typeof crop.y !== "number" || typeof crop.w !== "number" || typeof crop.h !== "number") return [];
    return [shot];
  });
}

function isConsent(value: unknown): value is Consent {
  if (!value || typeof value !== "object") return false;
  const consent = value as Consent;
  return (
    typeof consent.trail === "boolean" &&
    typeof consent.notes === "boolean" &&
    typeof consent.nudges === "boolean"
  );
}

export function normalizeTangents(value: unknown): TangentsState {
  if (!value || typeof value !== "object") return initialTangentsState;
  const raw = value as Partial<TangentsState>;
  const visits = Array.isArray(raw.visits)
    ? raw.visits.filter(
        (visit): visit is Visit =>
          !!visit &&
          typeof visit === "object" &&
          typeof visit.id === "string" &&
          typeof visit.plateId === "string" &&
          !!getPlate(visit.plateId) &&
          (visit.via === "open" || visit.via === "detour"),
      )
    : [];
  const saves: Record<string, Save> = {};
  if (raw.saves && typeof raw.saves === "object") {
    for (const [key, save] of Object.entries(raw.saves)) {
      if (!save || typeof save !== "object") continue;
      if (!getPlate(key) || typeof save.eye !== "string") continue;
      saves[key] = {
        plateId: key,
        eye: save.eye,
        note: typeof save.note === "string" ? save.note : "",
        updatedAt: typeof save.updatedAt === "number" ? save.updatedAt : 0,
      };
    }
  }
  return {
    startedAt: typeof raw.startedAt === "number" ? raw.startedAt : null,
    endedAt: typeof raw.endedAt === "number" ? raw.endedAt : null,
    sessionName: typeof raw.sessionName === "string" && raw.sessionName.trim() ? raw.sessionName.slice(0, 48) : "Sample session",
    consent: isConsent(raw.consent) ? raw.consent : initialTangentsState.consent,
    visits,
    saves,
    searches: readSearches(raw.searches),
    shots: readShots(raw.shots),
    nudgeDismissed: raw.nudgeDismissed === true,
    nudgeFollowed: raw.nudgeFollowed === true,
    shifts: typeof raw.shifts === "number" && raw.shifts >= 0 ? Math.floor(raw.shifts) : 0,
  };
}
