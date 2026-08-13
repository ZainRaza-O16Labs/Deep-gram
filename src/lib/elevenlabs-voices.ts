export interface ElevenLabsVoiceOption {
  id: string;
  label: string;
}

export const ELEVENLABS_VOICE_OPTIONS: readonly ElevenLabsVoiceOption[] = [
  {
    id: "qVQZlovuzsJ5qYmX6ptN",
    label: "American male assistant",
  },
  {
    id: "kMV9t3Ez1nb2QxJqykZk",
    label: "American female assistant",
  },
  {
    id: "VglOOf0dF5OhVDRMH8SH",
    label: "Casual boy",
  },
] as const;

export const DEFAULT_ELEVENLABS_VOICE_ID = "qVQZlovuzsJ5qYmX6ptN";
