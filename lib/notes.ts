import { clampCrop, isCrop, type Crop } from "@/lib/crop";
import { createId } from "@/lib/utils";
import { getPlate } from "@/lib/samples";

export type ReferenceNote = {
  id: string;
  plateId: string | null;
  title: string;
  imageSrc: string;
  alt: string;
  crop: Crop;
  note: string;
  source: string;
  createdAt: number;
  updatedAt: number;
};

export type NotesDraft = {
  plateId: string | null;
  title: string;
  imageSrc: string;
  alt: string;
  source: string;
  suggestedCrop: Crop;
};

export type NotesState = {
  projectName: string;
  references: ReferenceNote[];
  draft: NotesDraft | null;
};

export const initialNotesState: NotesState = {
  projectName: "My pictures",
  references: [],
  draft: null,
};

export function setDraftFromPlate(plateId: string): NotesDraft | null {
  const plate = getPlate(plateId);
  if (!plate) return null;
  return {
    plateId: plate.id,
    title: plate.title,
    imageSrc: plate.src,
    alt: plate.alt,
    source: plate.credit,
    suggestedCrop: plate.suggestedCrop,
  };
}

export type NoteSaveResult =
  | { ok: true; state: NotesState; id: string }
  | { ok: false; error: string; state: NotesState };

export function saveReference(
  state: NotesState,
  input: {
    id?: string;
    plateId: string | null;
    title: string;
    imageSrc: string;
    alt: string;
    crop: Crop | null;
    note: string;
    source: string;
  },
  now = Date.now(),
): NoteSaveResult {
  const note = input.note.trim();
  const source = input.source.trim();
  const title = input.title.trim() || "Untitled reference";
  if (!input.imageSrc) {
    return { ok: false, error: "Choose a picture before saving.", state };
  }
  if (!input.crop) {
    return { ok: false, error: "Draw a box on the part you want.", state };
  }
  if (!note) {
    return { ok: false, error: "Write what you liked about it.", state };
  }
  if (!source) {
    return { ok: false, error: "Add where the picture came from.", state };
  }
  const crop = clampCrop(input.crop);
  const existing = input.id ? state.references.find((item) => item.id === input.id) : undefined;
  const id = existing?.id ?? createId("ref");
  const next: ReferenceNote = {
    id,
    plateId: input.plateId,
    title,
    imageSrc: input.imageSrc,
    alt: input.alt || title,
    crop,
    note,
    source,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const references = existing
    ? state.references.map((item) => (item.id === id ? next : item))
    : [next, ...state.references];
  return {
    ok: true,
    id,
    state: { ...state, references, draft: null },
  };
}

export function removeReference(state: NotesState, id: string): NotesState {
  return { ...state, references: state.references.filter((item) => item.id !== id) };
}

function normalizeNote(value: unknown): ReferenceNote | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ReferenceNote>;
  if (typeof raw.id !== "string" || typeof raw.imageSrc !== "string" || typeof raw.note !== "string") return null;
  if (!isCrop(raw.crop)) return null;
  return {
    id: raw.id,
    plateId: typeof raw.plateId === "string" ? raw.plateId : null,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : "Untitled reference",
    imageSrc: raw.imageSrc,
    alt: typeof raw.alt === "string" ? raw.alt : "Saved reference image",
    crop: clampCrop(raw.crop),
    note: raw.note,
    source: typeof raw.source === "string" ? raw.source : "",
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : 0,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  };
}

export function normalizeNotes(value: unknown): NotesState {
  if (!value || typeof value !== "object") return initialNotesState;
  const raw = value as Partial<NotesState>;
  const references = Array.isArray(raw.references)
    ? raw.references.map(normalizeNote).filter((item): item is ReferenceNote => !!item)
    : [];
  let draft: NotesDraft | null = null;
  if (raw.draft && typeof raw.draft === "object" && typeof raw.draft.imageSrc === "string") {
    draft = {
      plateId: typeof raw.draft.plateId === "string" ? raw.draft.plateId : null,
      title: typeof raw.draft.title === "string" ? raw.draft.title : "Uploaded image",
      imageSrc: raw.draft.imageSrc,
      alt: typeof raw.draft.alt === "string" ? raw.draft.alt : "Uploaded image",
      source: typeof raw.draft.source === "string" ? raw.draft.source : "",
      suggestedCrop: isCrop(raw.draft.suggestedCrop) ? clampCrop(raw.draft.suggestedCrop) : { x: 30, y: 30, w: 40, h: 40 },
    };
  }
  return {
    projectName:
      typeof raw.projectName === "string" && raw.projectName.trim()
        ? raw.projectName.trim().slice(0, 60)
        : "My pictures",
    references,
    draft,
  };
}
