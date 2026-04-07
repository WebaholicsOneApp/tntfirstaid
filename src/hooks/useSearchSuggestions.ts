"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SearchSuggestionsResponse } from "~/types";

interface UseSearchSuggestionsOptions {
  minLength?: number;
}

interface UseSearchSuggestionsResult {
  suggestions: SearchSuggestionsResponse | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

const EMPTY_SUGGESTIONS: SearchSuggestionsResponse = {
  products: [],
  categories: [],
  queryType: "keyword",
};

/**
 * Hook for fetching search suggestions from the API
 * Handles loading states, errors, and request cancellation
 *
 * @param query - The search query (should be debounced)
 * @param options - Configuration options
 * @returns Suggestions, loading state, and error
 */
export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {},
): UseSearchSuggestionsResult {
  const { minLength = 2 } = options;

  const [suggestions, setSuggestions] =
    useState<SearchSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track the current AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setSuggestions(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    // Reset if query is too short
    if (trimmed.length < minLength) {
      setSuggestions(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: abortController.signal },
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch suggestions");
        }

        const data: SearchSuggestionsResponse = await response.json();
        setSuggestions(data);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(err instanceof Error ? err.message : "An error occurred");
        setSuggestions(EMPTY_SUGGESTIONS);
      } finally {
        // Only update loading state if this is still the current request
        if (abortControllerRef.current === abortController) {
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();

    // Cleanup: abort request on unmount or query change
    return () => {
      abortController.abort();
    };
  }, [query, minLength]);

  return {
    suggestions,
    isLoading,
    error,
    reset,
  };
}
