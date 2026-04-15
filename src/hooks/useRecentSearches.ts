"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tnt-first-aid-recent-searches";
const MAX_SEARCHES = 8;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // SSR-safe: read from localStorage only in useEffect
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const persist = useCallback((searches: string[]) => {
    setRecentSearches(searches);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      // Deduplicate case-insensitive, keep most recent first
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase(),
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_SEARCHES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(
        (s) => s.toLowerCase() !== query.toLowerCase(),
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { recentSearches, addSearch, removeSearch, clearAll };
}
