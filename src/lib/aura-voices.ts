export type AuraVoiceGender = "feminine" | "masculine";

export interface AuraVoiceOption {
  id: string;
  label: string;
  gender: AuraVoiceGender;
}

export const DEFAULT_AURA_SPEAK_MODEL = "aura-2-thalia-en";

export const AURA_VOICE_OPTIONS: readonly AuraVoiceOption[] = [
  { id: "aura-2-thalia-en", label: "Thalia", gender: "feminine" },
  { id: "aura-2-luna-en", label: "Luna", gender: "feminine" },
  { id: "aura-2-helena-en", label: "Helena", gender: "feminine" },
  { id: "aura-2-andromeda-en", label: "Andromeda", gender: "feminine" },
  { id: "aura-2-athena-en", label: "Athena", gender: "feminine" },
  { id: "aura-2-apollo-en", label: "Apollo", gender: "masculine" },
  { id: "aura-2-arcas-en", label: "Arcas", gender: "masculine" },
  { id: "aura-2-odysseus-en", label: "Odysseus", gender: "masculine" },
] as const;
