export interface ElevenLabsVoiceOption {
  id: string;
  label: string;
}

function pushVoice(
  options: ElevenLabsVoiceOption[],
  id: string | undefined,
  label: string | undefined,
  fallbackLabel: string,
) {
  const trimmedId = id?.trim() ?? "";
  if (!trimmedId) {
    return;
  }
  options.push({
    id: trimmedId,
    label: label?.trim() || fallbackLabel,
  });
}

function parseVoiceJson(raw: string | undefined): ElevenLabsVoiceOption[] {
  if (!raw?.trim()) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const options: ElevenLabsVoiceOption[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const record = item as { id?: unknown; label?: unknown; name?: unknown };
      const id = typeof record.id === "string" ? record.id.trim() : "";
      if (!id) {
        continue;
      }
      const label =
        (typeof record.label === "string" && record.label.trim()) ||
        (typeof record.name === "string" && record.name.trim()) ||
        id;
      options.push({ id, label });
    }
    return options;
  } catch {
    return [];
  }
}

function parseVoicesFromEnv(): ElevenLabsVoiceOption[] {
  // Must use static process.env.NEXT_PUBLIC_* reads — Next.js does not
  // inline dynamic process.env[key] into the browser bundle.
  const fromJson = parseVoiceJson(process.env.NEXT_PUBLIC_ELEVENLABS_VOICES);
  if (fromJson.length > 0) {
    return fromJson;
  }

  const options: ElevenLabsVoiceOption[] = [];
  pushVoice(
    options,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME,
    "Voice 1",
  );
  pushVoice(
    options,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_2,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_2,
    "Voice 2",
  );
  pushVoice(
    options,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_3,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_3,
    "Voice 3",
  );
  pushVoice(
    options,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_4,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_4,
    "Voice 4",
  );
  pushVoice(
    options,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_5,
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_5,
    "Voice 5",
  );
  return options;
}

export const ELEVENLABS_VOICE_OPTIONS: readonly ElevenLabsVoiceOption[] =
  parseVoicesFromEnv();

export const DEFAULT_ELEVENLABS_VOICE_ID =
  ELEVENLABS_VOICE_OPTIONS[0]?.id ?? "";
