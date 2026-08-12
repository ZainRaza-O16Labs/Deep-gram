"use client";

interface VoiceIndicatorProps {
  active: boolean;
  label: string;
  tone: "listening" | "speaking";
}

export function VoiceIndicator({ active, label, tone }: VoiceIndicatorProps) {
  const barColor =
    tone === "listening" ? "bg-listening" : "bg-speaking";

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-border bg-white px-6 py-5 shadow-sm ${
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
