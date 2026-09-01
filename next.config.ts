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

function publicVoiceEnv(env: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  const id1 = (env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID ||
    env.ELEVENLABS_VOICE_ID ||
    env.ELEVENLABS_VOICE_ID_1 ||
    "").trim();
  const name1 = (env.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME ||
    env.ELEVENLABS_VOICE_NAME ||
    env.ELEVENLABS_VOICE_NAME_1 ||
    "").trim();
  if (id1) {
    out.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = id1;
  }
  if (name1) {
    out.NEXT_PUBLIC_ELEVENLABS_VOICE_NAME = name1;
  }
  for (let index = 2; index <= 9; index += 1) {
    const id = (
      env[`NEXT_PUBLIC_ELEVENLABS_VOICE_ID_${index}`] ||
      env[`ELEVENLABS_VOICE_ID_${index}`] ||
      ""
    ).trim();
    const name = (
      env[`NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_${index}`] ||
      env[`ELEVENLABS_VOICE_NAME_${index}`] ||
      ""
    ).trim();
    if (id) {
      out[`NEXT_PUBLIC_ELEVENLABS_VOICE_ID_${index}`] = id;
    }
    if (name) {
      out[`NEXT_PUBLIC_ELEVENLABS_VOICE_NAME_${index}`] = name;
    }
  }
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
