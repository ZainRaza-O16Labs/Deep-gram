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
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-6 py-8 sm:gap-8 sm:py-10">
      <header className="flex shrink-0 flex-col items-center gap-3 text-center">
        <p className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Hey Sage
        </p>
        <p className="max-w-lg text-sm leading-relaxed text-foreground/80 sm:text-base">
          Talk naturally , Sage picks up when you finish
          a thought, with live transcripts.
        </p>
        <StatusBadge status={status} />
      </header>

      <section className="grid shrink-0 grid-cols-2 gap-4 sm:gap-6">
        <VoiceIndicator
          active={
            isListening || status === ConversationStatus.Connecting
          }
          label="Microphone"
          tone="listening"
        />
        <VoiceIndicator
          active={isSpeaking || status === ConversationStatus.Thinking}
          label="Assistant"
          tone="speaking"
        />
      </section>

      <div className="shrink-0">
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
      </div>

      <section className="flex min-h-[240px] flex-1 flex-col gap-3 pb-4">
        <h2 className="shrink-0 text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
          Live transcript
        </h2>
        <TranscriptPanel entries={transcripts} />
      </section>
    </div>
  );
}
