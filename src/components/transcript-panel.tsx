"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { SpeakerRole, type TranscriptEntry } from "@/types/conversation";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  assistantName?: string;
  listening?: boolean;
  speaking?: boolean;
  thinking?: boolean;
  idle?: boolean;
}

function splitWhatsApp(text: string): {
  content: string;
  waNumber: string | null;
} {
  const waMatch = text.match(/WA_BUTTON:([0-9]+)/);
  if (waMatch?.[1]) {
    return {
      content: text.replace(/WA_BUTTON:[0-9]+/, "").trim(),
      waNumber: waMatch[1],
    };
  }

  const waMarkdownMatch = text.match(
    /\[(.*?)\]\s*\(\s*https?:\/\/wa\.me\/([0-9]+)\s*\)/,
  );
  if (waMarkdownMatch?.[2]) {
    return {
      content: text
        .replace(
          /You can also reach out at\s*\[(.*?)\]\s*\(\s*https?:\/\/wa\.me\/([0-9]+)\s*\)\.?/,
          "",
        )
        .replace(/\[(.*?)\]\s*\(\s*https?:\/\/wa\.me\/([0-9]+)\s*\)/, "")
        .trim(),
      waNumber: waMarkdownMatch[2],
    };
  }

  return { content: text, waNumber: null };
}

export function TranscriptPanel({
  entries,
  assistantName = "Assistant",
  listening = false,
  speaking = false,
  thinking = false,
  idle = false,
}: TranscriptPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const node = listRef.current;
    if (!node || !stickToBottomRef.current) {
      return;
    }

    node.scrollTo({ top: node.scrollHeight, behavior: "auto" });
  }, [entries, thinking]);

  const visibleEntries = entries.filter((entry) => {
    if (entry.role === SpeakerRole.User) {
      return entry.text.trim().length > 0;
    }
    const { content, waNumber } = splitWhatsApp(entry.text);
    return content.trim().length > 0 || Boolean(waNumber) || !entry.isFinal;
  });

  return (
    <div
      ref={listRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6"
      aria-live="polite"
      onScroll={(event) => {
        const node = event.currentTarget;
        const distanceFromBottom =
          node.scrollHeight - node.scrollTop - node.clientHeight;
        stickToBottomRef.current = distanceFromBottom < 80;
      }}
    >
      {visibleEntries.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center gap-1 rounded-full border border-border bg-white shadow-sm">
            {[0, 1, 2, 3, 4].map((index) => (
              <span
                key={index}
                className="wave-bar inline-block h-6 w-1 rounded-full bg-accent/80"
                style={{ animationDelay: `${index * 0.12}s` }}
              />
            ))}
          </div>
          <p className="font-display text-2xl text-foreground">Ready when you are</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            {idle
              ? `Start a conversation, then talk. ${assistantName} picks up when you finish a thought.`
              : "Listening… say something when you’re ready."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 pb-2">
          {visibleEntries.map((entry, index) => {
            const isUser = entry.role === SpeakerRole.User;
            const { content, waNumber } = isUser
              ? { content: entry.text, waNumber: null }
              : splitWhatsApp(entry.text);
            const isEmptyAssistant =
              !isUser && !content.trim() && !waNumber && !entry.isFinal;

            return (
              <div
                key={`${entry.id}-${index}`}
                className={`flex max-w-full flex-col gap-1 ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <span className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {isUser ? "You" : assistantName}
                  {!entry.isFinal ? " · …" : ""}
                </span>
                {isUser ? (
                  <p
                    className={`max-w-[min(82%,28rem)] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm leading-relaxed text-on-accent ${
                      entry.isFinal ? "" : "opacity-70"
                    }`}
                  >
                    {entry.text}
                  </p>
                ) : isEmptyAssistant ? (
                  <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-2.5 text-sm text-muted shadow-sm">
                    {assistantName} is thinking…
                  </div>
                ) : (
                  <div
                    className={`markdown-body max-w-[min(90%,36rem)] rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm ${
                      entry.isFinal ? "" : "opacity-70"
                    }`}
                  >
                    {content.trim() ? (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            const isWa = href?.includes("wa.me");
                            if (isWa) {
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 font-bold text-white no-underline shadow-sm"
                                >
                                  {children}
                                </a>
                              );
                            }
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-accent underline"
                              >
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    ) : null}
                    {waNumber ? (
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 font-bold text-white no-underline shadow-sm"
                      >
                        Contact Owner on WhatsApp
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
          {thinking ? (
            <p className="px-1 text-xs text-muted">{assistantName} is thinking…</p>
          ) : listening ? (
            <p className="px-1 text-xs text-muted">Listening…</p>
          ) : speaking ? (
            <p className="px-1 text-xs text-muted">{assistantName} is speaking…</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
