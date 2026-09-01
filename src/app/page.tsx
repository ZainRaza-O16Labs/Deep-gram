import { VoiceAssistant } from "@/components/voice-assistant";

export default function Home() {
  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(47,143,128,0.10),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(61,125,214,0.07),_transparent_50%)]"
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <VoiceAssistant />
      </div>
    </main>
  );
}
