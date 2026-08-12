"use client";

import { useEffect, useRef } from "react";
import { SpeakerRole, type TranscriptEntry } from "@/types/conversation";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth",
    });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center text-sm font-medium text-muted shadow-sm">
        Transcripts will appear here once the conversation starts.
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-white p-4 shadow-sm"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3">
        {entries.map((entry, index) => {
          const isUser = entry.role === SpeakerRole.User;

          return (
            <div
              key={`${entry.id}-${index}`}
              className={`flex flex-col gap-1 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70">
                {isUser ? "You" : "Sage"}
                {!entry.isFinal ? " · …" : ""}
              </span>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-accent-soft text-foreground"
                    : "border border-border bg-surface text-foreground"
                } ${entry.isFinal ? "" : "opacity-70"}`}
              >
                {entry.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
