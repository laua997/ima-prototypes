import { clampCrop, isCrop, type Crop } from "@/lib/crop";
import { createId } from "@/lib/utils";
import { getPlate, sourceLine } from "@/lib/samples";

export type DeckCard = {
  id: string;
  plateId: string | null;
  title: string;
  imageSrc: string;
  alt: string;
  crop: Crop;
  note: string;
  source: string;
};

export type DeckState = {
  cards: DeckCard[];
};

export const initialDeckState: DeckState = { cards: [] };

export function cardFromPlate(plateId: string): DeckCard | null {
  const plate = getPlate(plateId);
  if (!plate) return null;
  return {
    id: createId("card"),
    plateId: plate.id,
    title: plate.title,
    imageSrc: plate.src,
    alt: plate.alt,
    crop: clampCrop(plate.suggestedCrop),
    note: "",
    source: sourceLine(plate),
  };
}

export function buildDeck(existing: DeckCard[], plateIds: string[], uploads: DeckCard[]): DeckCard[] {
  const byPlate = new Map(existing.filter((card) => card.plateId).map((card) => [card.plateId as string, card]));
  const chosen = plateIds
    .map((id) => byPlate.get(id) ?? cardFromPlate(id))
    .filter((card): card is DeckCard => !!card);
  const uploadIds = new Set(uploads.map((card) => card.id));
  const keptUploads = existing.filter((card) => !card.plateId && uploadIds.has(card.id));
  const freshUploads = uploads.filter((card) => !existing.some((item) => item.id === card.id));
  return [...chosen, ...keptUploads, ...freshUploads];
}

export function moveCard(cards: DeckCard[], index: number, direction: -1 | 1): DeckCard[] {
  const next = index + direction;
  if (index < 0 || index >= cards.length || next < 0 || next >= cards.length) return cards;
  const copy = cards.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

export function updateCard(
  cards: DeckCard[],
  id: string,
  patch: Partial<Pick<DeckCard, "crop" | "note" | "source" | "title">>,
): DeckCard[] {
  return cards.map((card) => {
    if (card.id !== id) return card;
    return {
      ...card,
      ...patch,
      crop: patch.crop ? clampCrop(patch.crop) : card.crop,
      note: patch.note !== undefined ? patch.note : card.note,
      source: patch.source !== undefined ? patch.source : card.source,
      title: patch.title !== undefined ? patch.title.trim().slice(0, 80) || card.title : card.title,
    };
  });
}

function normalizeCard(value: unknown): DeckCard | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<DeckCard>;
  if (typeof raw.id !== "string" || typeof raw.imageSrc !== "string" || !isCrop(raw.crop)) return null;
  return {
    id: raw.id,
    plateId: typeof raw.plateId === "string" ? raw.plateId : null,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : "Untitled card",
    imageSrc: raw.imageSrc,
    alt: typeof raw.alt === "string" ? raw.alt : "Reference card image",
    crop: clampCrop(raw.crop),
    note: typeof raw.note === "string" ? raw.note : "",
    source: typeof raw.source === "string" ? raw.source : "",
  };
}

export function normalizeDeck(value: unknown): DeckState {
  if (!value || typeof value !== "object") return initialDeckState;
  const raw = value as Partial<DeckState>;
  const cards = Array.isArray(raw.cards)
    ? raw.cards.map(normalizeCard).filter((card): card is DeckCard => !!card)
    : [];
  return { cards };
}
