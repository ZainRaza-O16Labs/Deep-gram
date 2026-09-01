"use client";

import {
  DEFAULT_ELEVENLABS_VOICE_ID,
  ELEVENLABS_VOICE_OPTIONS,
} from "@/lib/elevenlabs-voices";
import { ConversationStatus } from "@/types/conversation";

interface ConversationControlsProps {
  status: ConversationStatus;
  errorMessage: string | null;
  elevenLabsVoiceId: string;
  onElevenLabsVoiceIdChange: (voiceId: string) => void;
  onStart: () => void;
  onStop: () => void;
}

export function ConversationControls({
  status,
  errorMessage,
  elevenLabsVoiceId,
  onElevenLabsVoiceIdChange,
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

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-[16rem]">
          <label htmlFor="voice-picker" className="sr-only">
            Voice
          </label>
          <select
            id="voice-picker"
            value={elevenLabsVoiceId || DEFAULT_ELEVENLABS_VOICE_ID}
            disabled={!canStart}
            onChange={(event) => onElevenLabsVoiceIdChange(event.target.value)}
            className="h-11 w-full cursor-pointer appearance-none rounded-full border border-border bg-white py-0 pl-4 pr-10 text-sm font-medium text-foreground outline-none transition enabled:hover:border-accent enabled:focus-visible:border-accent enabled:focus-visible:ring-2 enabled:focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-55"
          >
            {ELEVENLABS_VOICE_OPTIONS.length === 0 ? (
              <option value="">No voices configured</option>
            ) : (
              ELEVENLABS_VOICE_OPTIONS.map((voice, index) => (
                <option key={`${voice.id}-${index}`} value={voice.id}>
                  {voice.label}
                </option>
              ))
            )}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-muted"
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

        <div className="flex items-center gap-2">
          {canStart ? (
            <button
              type="button"
              onClick={onStart}
              className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-sm transition hover:brightness-110"
            >
              Start conversation
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              disabled={!canStop}
              className="h-11 rounded-full border border-danger/30 bg-white px-6 text-sm font-semibold text-danger shadow-sm transition enabled:hover:bg-danger enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
            >
              Stop
            </button>
          )}
        </div>
      </div>
      {errorMessage ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
