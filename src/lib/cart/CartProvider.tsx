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
import {
  cartCount,
  cartItemKey,
  cartSubtotalCents,
  type CartItem,
} from "./types";

const STORAGE_KEY = "mllelabeille.cart.v1";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  /** True once the cart has been rehydrated from storage. */
  ready: boolean;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Module-level singleton — the provider is mounted once per app. */
const store = createLocalStore<CartItem[]>(STORAGE_KEY, []);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const ready = useHydrated();

  const addItem = useCallback(
    (item: Omit<CartItem, "key">) => {
      const key = cartItemKey(
        item.illustrationSlug,
        item.productSlug,
        item.variantId,
        item.personalization,
      );
      store.set((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
          );
        }
        return [...prev, { ...item, key }];
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      store.set((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.key !== key)
          : prev.map((i) =>
              i.key === key ? { ...i, quantity: Math.min(quantity, 99) } : i,
            ),
      );
    },
    [],
  );

  const removeItem = useCallback(
    (key: string) => {
      store.set((prev) => prev.filter((i) => i.key !== key));
    },
    [],
  );

  const clear = useCallback(() => {
    store.set(() => []);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      subtotalCents: cartSubtotalCents(items),
      ready,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, ready, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
