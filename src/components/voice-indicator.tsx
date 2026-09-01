"use client";

interface VoiceIndicatorProps {
  active: boolean;
  label: string;
  tone: "listening" | "speaking";
  compact?: boolean;
}

export function VoiceIndicator({
  active,
  label,
  tone,
  compact = false,
}: VoiceIndicatorProps) {
  const barColor =
    tone === "listening" ? "bg-listening" : "bg-speaking";

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
          active
            ? "border-accent/40 bg-white shadow-sm"
            : "border-border/80 bg-white/70"
        }`}
        aria-label={`${label}: ${active ? "active" : "idle"}`}
      >
        <span className="flex h-5 items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((index) => (
            <span
              key={index}
              className={`wave-bar inline-block w-0.5 rounded-full ${barColor} ${
                active ? "h-4" : "h-2.5 opacity-50"
              }`}
              style={{
                animationDelay: `${index * 0.12}s`,
                animationPlayState: active ? "running" : "paused",
              }}
            />
          ))}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border border-border bg-white px-5 py-4 shadow-sm ${
        active ? "ring-2 ring-accent/30" : ""
      }`}
      aria-label={`${label}: ${active ? "active" : "inactive"}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center gap-1 rounded-full border border-border bg-surface ${
          active ? "animate-pulse-ring" : ""
        }`}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className={`wave-bar inline-block h-6 w-1 rounded-full ${barColor} ${
              active ? "" : "opacity-70"
            }`}
            style={{
              animationDelay: `${index * 0.12}s`,
              animationPlayState: active ? "running" : "paused",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">
        {label}
      </span>
    </div>
  );
}
