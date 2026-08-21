export interface ElevenLabsVoiceOption {
  id: string;
  label: string;
}

export const ELEVENLABS_VOICE_OPTIONS: readonly ElevenLabsVoiceOption[] = [
  {
    id: "tDWqpJqVfmGuscYiTW4S",
    label: "American male assistant",
  },
  {
    id: "4JTAzuWlfPW7E9flqztf",
    label: "American female assistant",
  },
  {
    id: "ge8osjHb74eUeZF0JRiV",
    label: "Casual boy",
  },
] as const;

export const DEFAULT_ELEVENLABS_VOICE_ID = "tDWqpJqVfmGuscYiTW4S";
