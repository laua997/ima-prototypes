"use client";

import { usePersistentState } from "@/components/use-persistent";
import { initialDeckState, normalizeDeck } from "@/lib/deck";

export const DECK_KEY = "ima-deck-v1";

export function useDeck() {
  return usePersistentState(DECK_KEY, initialDeckState, normalizeDeck);
}
