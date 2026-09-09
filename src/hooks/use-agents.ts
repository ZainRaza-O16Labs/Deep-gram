"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchActiveAgents, type PublicAgent } from "@/lib/agents-api";

const CACHE_MS = 60_000;

let cachedAgents: PublicAgent[] | null = null;
let cachedAt = 0;

export function useAgents() {
  const [agents, setAgents] = useState<PublicAgent[]>(cachedAgents ?? []);
  const [loading, setLoading] = useState(!cachedAgents);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchActiveAgents();
      cachedAgents = next;
      cachedAt = Date.now();
      setAgents(next);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load agents.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedAgents && Date.now() - cachedAt < CACHE_MS) {
      return;
    }

    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  return { agents, loading, error, reload };
}
