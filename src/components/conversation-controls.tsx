"use client";

import {
  AURA_VOICE_OPTIONS,
  DEFAULT_AURA_SPEAK_MODEL,
} from "@/lib/aura-voices";
import { ConversationStatus } from "@/types/conversation";

interface ConversationControlsProps {
  status: ConversationStatus;
  errorMessage: string | null;
  speakModel: string;
  onSpeakModelChange: (speakModel: string) => void;
  onStart: () => void;
  onStop: () => void;
}

export function ConversationControls({
  status,
  errorMessage,
  speakModel,
  onSpeakModelChange,
  onStart,
  onStop,
}: ConversationControlsProps) {
  const canStart =
    status === ConversationStatus.Idle ||
    status === ConversationStatus.Disconnected ||
    status === ConversationStatus.Error;

  const canStop =
    status === ConversationStatus.Connecting ||
    status === ConversationStatus.Listening ||
    status === ConversationStatus.Thinking ||
    status === ConversationStatus.Speaking;

  const voiceSelectEnabled = canStart;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <span
          id="voice-picker-label"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Voice
        </span>
        <div className="relative">
          <select
            id="voice-picker"
            aria-labelledby="voice-picker-label"
            value={speakModel || DEFAULT_AURA_SPEAK_MODEL}
            disabled={!voiceSelectEnabled}
            onChange={(event) => onSpeakModelChange(event.target.value)}
            className="h-11 min-w-[11.5rem] cursor-pointer appearance-none rounded-full border border-border bg-surface-elevated py-0 pl-5 pr-11 text-sm font-semibold text-foreground shadow-sm outline-none transition enabled:hover:border-accent enabled:focus-visible:border-accent enabled:focus-visible:ring-2 enabled:focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-55"
          >
            {AURA_VOICE_OPTIONS.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="h-11 rounded-full bg-accent px-7 text-sm font-semibold text-on-accent transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Start Conversation
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!canStop}
          className="h-11 rounded-full border border-border bg-surface-elevated px-7 text-sm font-semibold text-foreground shadow-sm transition enabled:hover:border-danger enabled:hover:text-danger disabled:cursor-not-allowed disabled:opacity-55"
        >
          Stop Conversation
        </button>
      </div>
      {errorMessage ? (
        <p className="max-w-md text-center text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
