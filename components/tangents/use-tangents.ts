"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePersistentState } from "@/components/use-persistent";
import { initialTangentsState, normalizeTangents } from "@/lib/tangents";

export const TANGENTS_KEY = "ima-tangents-v1";

export function useTangents() {
  return usePersistentState(TANGENTS_KEY, initialTangentsState, normalizeTangents);
}

export function useRequiredSession() {
  const store = useTangents();
  const router = useRouter();
  useEffect(() => {
    let started = false;
    try {
      const raw = localStorage.getItem(TANGENTS_KEY);
      if (raw) started = normalizeTangents(JSON.parse(raw)).startedAt !== null;
    } catch {
      started = false;
    }
    if (!started) router.replace("/tangents");
  }, [router]);
  return store;
}
