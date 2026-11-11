"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

type Entry = { raw: string | null; value: unknown };

const cache = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: () => void) {
  let bucket = listeners.get(key);
  if (!bucket) {
    bucket = new Set();
    listeners.set(key, bucket);
  }
  bucket.add(listener);
  return () => {
    bucket.delete(listener);
  };
}

function readStored<T>(key: string, initial: T, normalize: (value: unknown) => T): T {
  if (typeof window === "undefined") return initial;
  const raw = localStorage.getItem(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value = initial;
  if (raw) {
    try {
      value = normalize(JSON.parse(raw));
    } catch {
      value = initial;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function usePersistentState<T>(key: string, initial: T, normalize: (value: unknown) => T) {
  const value = useSyncExternalStore(
    (listener) => subscribe(key, listener),
    () => readStored(key, initial, normalize),
    () => initial,
  );

  useEffect(() => {
    emit(key);
  }, [key]);

  const commit = useCallback(
    (next: T) => {
      const raw = JSON.stringify(next);
      try {
        localStorage.setItem(key, raw);
      } catch {
        /* Keep the in-memory copy if the browser refuses more storage. */
      }
      cache.set(key, { raw, value: next });
      emit(key);
    },
    [key],
  );

  const reset = useCallback(() => {
    localStorage.removeItem(key);
    cache.set(key, { raw: null, value: initial });
    emit(key);
  }, [initial, key]);

  return { value, commit, reset, ready: true as const };
}
