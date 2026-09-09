"use client";

import type { PublicAgent } from "@/lib/agents-api";

export function AgentPicker({
  agents,
  selectedAgentId,
  loading,
  error,
  onSelect,
  onRetry,
}: {
  agents: PublicAgent[];
  selectedAgentId: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (agentId: string | null) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading agents…</p>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          className="text-sm underline"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active agents are available yet.
      </p>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">Agent</span>
      <select
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        value={selectedAgentId ?? ""}
        onChange={(event) =>
          onSelect(event.target.value ? event.target.value : null)
        }
      >
        <option value="">Auto — best agent</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
      {selectedAgentId ? (
        <p className="text-xs text-muted-foreground">
          {agents.find((agent) => agent.id === selectedAgentId)?.description ||
            " "}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Let the assistant pick the best-suited agent from your categories.
        </p>
      )}
    </label>
  );
}
