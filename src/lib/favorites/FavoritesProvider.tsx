"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createLocalStore, useHydrated } from "@/lib/localStore";

const STORAGE_KEY = "mllelabeille.favorites.v1";

interface FavoritesContextValue {
  slugs: string[];
  ready: boolean;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Module-level singleton — the provider is mounted once per app. */
const store = createLocalStore<string[]>(STORAGE_KEY, []);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const slugs = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const ready = useHydrated();

  const isFavorite = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  const toggle = useCallback(
    (slug: string) => {
      store.set((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
      );
    },
    [],
  );

  const value = useMemo(
    () => ({ slugs, ready, isFavorite, toggle }),
    [slugs, ready, isFavorite, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside <FavoritesProvider>");
  }
  return ctx;
}
