export interface ElevenLabsVoiceOption {
  id: string;
  label: string;
}

function envTrim(key: string): string {
  return (process.env[key] ?? "").trim();
}

function parseVoicesFromEnv(): ElevenLabsVoiceOption[] {
  const options: ElevenLabsVoiceOption[] = [];
  const firstId =
    envTrim("NEXT_PUBLIC_ELEVENLABS_VOICE_ID") ||
    envTrim("NEXT_PUBLIC_ELEVENLABS_VOICE_ID_1");
  if (firstId) {
    options.push({
      id: firstId,
      label:
        envTrim("NEXT_PUBLIC_ELEVENLABS_VOICE_NAME") ||
        envTrim("NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_1") ||
        "Voice 1",
    });
  }
  for (let index = 2; index <= 9; index += 1) {
    const id = envTrim(`NEXT_PUBLIC_ELEVENLABS_VOICE_ID_${index}`);
    if (!id) {
      continue;
    }
    options.push({
      id,
      label:
        envTrim(`NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_${index}`) || `Voice ${index}`,
    });
  }
  return options;
}

export const ELEVENLABS_VOICE_OPTIONS: readonly ElevenLabsVoiceOption[] =
  parseVoicesFromEnv();

export const DEFAULT_ELEVENLABS_VOICE_ID =
  ELEVENLABS_VOICE_OPTIONS[0]?.id ?? "";
