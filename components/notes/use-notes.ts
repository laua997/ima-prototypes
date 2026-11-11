"use client";

import { usePersistentState } from "@/components/use-persistent";
import { initialNotesState, normalizeNotes } from "@/lib/notes";

export const NOTES_KEY = "ima-notes-v1";

export function useNotes() {
  return usePersistentState(NOTES_KEY, initialNotesState, normalizeNotes);
}
