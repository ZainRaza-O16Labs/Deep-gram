"use client";

import { useState } from "react";
import { ConversationControls } from "@/components/conversation-controls";
import { StatusBadge } from "@/components/status-badge";
import { TranscriptPanel } from "@/components/transcript-panel";
import { VoiceIndicator } from "@/components/voice-indicator";
import { useVoiceConversation } from "@/hooks/use-voice-conversation";
import { DEFAULT_ELEVENLABS_VOICE_ID } from "@/lib/elevenlabs-voices";
import { ConversationStatus } from "@/types/conversation";

export function VoiceAssistant() {
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(
    DEFAULT_ELEVENLABS_VOICE_ID,
  );
  const {
    status,
    transcripts,
    errorMessage,
    isListening,
    isSpeaking,
    startConversation,
    stopConversation,
  } = useVoiceConversation();

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none tracking-tight text-foreground sm:text-[1.7rem]">
            Hey Sage
          </p>
          <p className="mt-1 hidden text-xs text-muted sm:block">
            Talk naturally — Sage answers when you finish a thought.
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      <TranscriptPanel
        entries={transcripts}
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
            label="Sage"
            tone="speaking"
          />
        </div>
        <ConversationControls
          status={status}
          errorMessage={errorMessage}
          elevenLabsVoiceId={elevenLabsVoiceId}
          onElevenLabsVoiceIdChange={setElevenLabsVoiceId}
          onStart={() => {
            void startConversation(undefined, elevenLabsVoiceId);
          }}
          onStop={stopConversation}
        />
      </footer>
    </div>
  );
}
