import { VoiceAssistant } from "@/components/voice-assistant";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(47,143,128,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(61,125,214,0.08),_transparent_50%)]"
      />
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
        <VoiceAssistant />
      </div>
    </main>
  );
}
