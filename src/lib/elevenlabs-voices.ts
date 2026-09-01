export interface ElevenLabsVoiceOption {
  id: string;
  label: string;
}

export const ELEVENLABS_VOICE_OPTIONS: readonly ElevenLabsVoiceOption[] = [
  {
    id: "K8TmlPGWoNFZwl9ZwDu7",
    label: "American male assistant",
  },
  {
    id: "SFQTpGJ7hNAESg374Mnp",
    label: "American female assistant",
  },
  {
    id: "GeLH5bYcMs6If67U5gtP",
    label: "Casual boy",
  },
] as const;

export const DEFAULT_ELEVENLABS_VOICE_ID = "K8TmlPGWoNFZwl9ZwDu7";
