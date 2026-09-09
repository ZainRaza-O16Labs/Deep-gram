"use client";

import { useEffect, useState } from "react";
import { ConversationControls } from "@/components/conversation-controls";
import { AgentPicker } from "@/components/agent-picker";
import { StatusBadge } from "@/components/status-badge";
import { TranscriptPanel } from "@/components/transcript-panel";
import { VoiceIndicator } from "@/components/voice-indicator";
import { useAgents } from "@/hooks/use-agents";
import { useVoiceConversation } from "@/hooks/use-voice-conversation";
import { ConversationStatus } from "@/types/conversation";

const SELECTED_AGENT_KEY = "hey-sage.selected-agent-id";

export function VoiceAssistant() {
  const { agents, loading, error, reload } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(SELECTED_AGENT_KEY),
  );
  const {
    status,
    transcripts,
    errorMessage,
    activeAgent,
    isListening,
    isSpeaking,
    startConversation,
    stopConversation,
  } = useVoiceConversation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedAgentId) {
        window.localStorage.setItem(SELECTED_AGENT_KEY, selectedAgentId);
      } else {
        window.localStorage.removeItem(SELECTED_AGENT_KEY);
      }
    }
  }, [agents, selectedAgentId]);

  const effectiveAgentId =
    selectedAgentId && agents.some((agent) => agent.id === selectedAgentId)
      ? selectedAgentId
      : null;
  const displayName =
    activeAgent?.name ??
    agents.find((a) => a.id === effectiveAgentId)?.name ??
    "Assistant";

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none tracking-tight text-foreground sm:text-[1.7rem]">
            {displayName}
          </p>
          <p className="mt-1 hidden text-xs text-muted sm:block">
            Talk naturally — your agent answers when you finish a thought.
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      <div className="shrink-0 border-b border-border/70 px-5 py-3 sm:px-6">
        <AgentPicker
          agents={agents}
          selectedAgentId={effectiveAgentId}
          loading={loading}
          error={error}
          onSelect={setSelectedAgentId}
          onRetry={() => void reload()}
        />
      </div>

      <TranscriptPanel
        entries={transcripts}
        assistantName={displayName}
        listening={isListening}
        speaking={isSpeaking}
        thinking={status === ConversationStatus.Thinking}
        idle={
          status === ConversationStatus.Idle ||
          status === ConversationStatus.Disconnected
        }
      />

      <footer className="shrink-0 border-t border-border/70 bg-white/80 px-5 py-3 backdrop-blur-md sm:px-6">
        <div className="mb-2.5 flex items-center gap-2">
          <VoiceIndicator
            compact
            active={
              isListening || status === ConversationStatus.Connecting
            }
            label="You"
            tone="listening"
          />
          <VoiceIndicator
            compact
            active={isSpeaking || status === ConversationStatus.Thinking}
            label={displayName}
            tone="speaking"
          />
        </div>
        <ConversationControls
          status={status}
          errorMessage={errorMessage}
          onStart={() => {
            void startConversation(effectiveAgentId);
          }}
          onStop={stopConversation}
          startDisabled={loading}
        />
      </footer>
    </div>
  );
}
