"use client";

/**
 * Wishlist — localStorage-backed save-for-later list.
 *
 * Persistence is intentionally client-side only for the MVP. Future iteration
 * can sync to OneApp when a customer is logged in.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "alpha-wishlist";
const CHANGE_EVENT = "alpha:wishlist-changed";
const MAX_ITEMS = 100;

export interface WishlistItem {
  /** Product ID (not variation). */
  productId: number;
  productSlug: string;
  name: string;
  price?: number | null;
  image?: string | null;
  brandName?: string | null;
  /** When the item was added (ISO 8601). */
  addedAt: string;
}

function isWishlistItem(v: unknown): v is WishlistItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.productId === "number" &&
    typeof o.productSlug === "string" &&
    typeof o.name === "string" &&
    typeof o.addedAt === "string"
  );
}

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isWishlistItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function writeStorage(items: WishlistItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage unavailable / quota exceeded — silently ignore.
  }
}

/**
 * React hook — returns the current wishlist and helpers. Subscribes to
 * cross-component changes via a custom event so all consumers stay in sync.
 */
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(readStorage());
    const handler = () => setItems(readStorage());
    window.addEventListener(CHANGE_EVENT, handler);
    // Also sync across browser tabs.
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const has = useCallback(
    (productId: number) => items.some((i) => i.productId === productId),
    [items],
  );

  const add = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    const current = readStorage();
    if (current.some((i) => i.productId === item.productId)) return;
    const next = [
      { ...item, addedAt: new Date().toISOString() },
      ...current,
    ].slice(0, MAX_ITEMS);
    writeStorage(next);
  }, []);

  const remove = useCallback((productId: number) => {
    const current = readStorage();
    const next = current.filter((i) => i.productId !== productId);
    writeStorage(next);
  }, []);

  const toggle = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    const current = readStorage();
    const exists = current.some((i) => i.productId === item.productId);
    if (exists) {
      writeStorage(current.filter((i) => i.productId !== item.productId));
    } else {
      const next = [
        { ...item, addedAt: new Date().toISOString() },
        ...current,
      ].slice(0, MAX_ITEMS);
      writeStorage(next);
    }
  }, []);

  const clear = useCallback(() => {
    writeStorage([]);
  }, []);

  return { items, count: items.length, has, add, remove, toggle, clear };
}
