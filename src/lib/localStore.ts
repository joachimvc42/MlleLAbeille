"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal localStorage-backed store, consumed with useSyncExternalStore —
 * SSR-safe (server snapshot = fallback) and free of setState-in-effect
 * hydration dances.
 */
export interface LocalStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (updater: (previous: T) => T) => void;
}

export function createLocalStore<T>(key: string, fallback: T): LocalStore<T> {
  let cache: T = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : fallback;
      cache = (parsed as T) ?? fallback;
    } catch {
      cache = fallback;
    }
    loaded = true;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      load();
      return cache;
    },
    getServerSnapshot() {
      return fallback;
    },
    set(updater) {
      load();
      cache = updater(cache);
      try {
        window.localStorage.setItem(key, JSON.stringify(cache));
      } catch {
        /* private mode or full storage — state stays in memory */
      }
      for (const listener of listeners) listener();
    },
  };
}

const noopSubscribe = () => () => {};

/** True once the client has hydrated (false during SSR & hydration pass). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
