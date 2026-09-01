import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

function parseEnvFile(filePath: string): Record<string, string> {
  let source = "";
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch {
    return {};
  }

  const parsed: Record<string, string> = {};
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}

function collectVoiceOptions(env: Record<string, string>) {
  const options: Array<{ id: string; label: string }> = [];
  const push = (
    id: string | undefined,
    name: string | undefined,
    index: number,
  ) => {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      return;
    }
    options.push({
      id: trimmedId,
      label: name?.trim() || `Voice ${index}`,
    });
  };

  push(
    env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID ||
      env.ELEVENLABS_VOICE_ID ||
      env.ELEVENLABS_VOICE_ID_1,
    env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME ||
      env.ELEVENLABS_VOICE_NAME ||
      env.ELEVENLABS_VOICE_NAME_1,
    1,
  );
  for (let index = 2; index <= 9; index += 1) {
    push(
      env[`NEXT_PUBLIC_ELEVENLABS_VOICE_ID_${index}`] ||
        env[`ELEVENLABS_VOICE_ID_${index}`],
      env[`NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_${index}`] ||
        env[`ELEVENLABS_VOICE_NAME_${index}`],
      index,
    );
  }
  return options;
}

function publicVoiceEnv(env: Record<string, string>): Record<string, string> {
  const voices = collectVoiceOptions(env);
  const out: Record<string, string> = {
    NEXT_PUBLIC_ELEVENLABS_VOICES: JSON.stringify(voices),
  };
  const first = voices[0];
  if (first) {
    out.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = first.id;
    out.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME = first.label;
  }
  voices.forEach((voice, index) => {
    if (index === 0) {
      return;
    }
    const slot = index + 1;
    out[`NEXT_PUBLIC_ELEVENLABS_VOICE_ID_${slot}`] = voice.id;
    out[`NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_${slot}`] = voice.label;
  });
  return out;
}

const rootEnv = {
  ...parseEnvFile(path.resolve(process.cwd(), "../../.env")),
  ...parseEnvFile(path.resolve(process.cwd(), ".env")),
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_WS_URL:
      rootEnv.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_WS_URL || "",
    ...publicVoiceEnv(rootEnv),
  },
};

export default nextConfig;
