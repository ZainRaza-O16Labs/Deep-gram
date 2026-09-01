"use client";

import { ConversationStatus } from "@/types/conversation";

interface StatusBadgeProps {
  status: ConversationStatus;
}

const STATUS_LABEL: Record<ConversationStatus, string> = {
  [ConversationStatus.Idle]: "Ready",
  [ConversationStatus.Connecting]: "Connecting…",
  [ConversationStatus.Listening]: "Listening",
  [ConversationStatus.Thinking]: "Thinking",
  [ConversationStatus.Speaking]: "Speaking",
  [ConversationStatus.Disconnected]: "Disconnected",
  [ConversationStatus.Error]: "Error",
};

const STATUS_COLOR: Record<ConversationStatus, string> = {
  [ConversationStatus.Idle]: "bg-muted",
  [ConversationStatus.Connecting]: "bg-thinking",
  [ConversationStatus.Listening]: "bg-listening",
  [ConversationStatus.Thinking]: "bg-thinking",
  [ConversationStatus.Speaking]: "bg-speaking",
  [ConversationStatus.Disconnected]: "bg-muted",
  [ConversationStatus.Error]: "bg-danger",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[13px] font-medium text-foreground shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${STATUS_COLOR[status]} ${
          status === ConversationStatus.Listening ||
          status === ConversationStatus.Speaking ||
          status === ConversationStatus.Thinking
            ? "animate-pulse"
            : ""
        }`}
      />
      {STATUS_LABEL[status]}
    </div>
  );
}
