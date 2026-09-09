"use client";

import { ConversationStatus } from "@/types/conversation";

interface ConversationControlsProps {
  status: ConversationStatus;
  errorMessage: string | null;
  onStart: () => void;
  onStop: () => void;
  startDisabled?: boolean;
}

export function ConversationControls({
  status,
  errorMessage,
  onStart,
  onStop,
  startDisabled = false,
}: ConversationControlsProps) {
  const canStart =
    !startDisabled &&
    (status === ConversationStatus.Idle ||
      status === ConversationStatus.Disconnected ||
      status === ConversationStatus.Error);

  const canStop =
    status === ConversationStatus.Connecting ||
    status === ConversationStatus.Listening ||
    status === ConversationStatus.Thinking ||
    status === ConversationStatus.Speaking;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {canStart ? (
            <button
              type="button"
              onClick={onStart}
              disabled={startDisabled}
              className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
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