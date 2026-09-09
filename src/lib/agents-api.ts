import type { AgentSummary, ChatRequest, ChatResponse } from "@hey-sage/shared";

export type PublicAgent = AgentSummary;

export function backendHttpUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_BACKEND_HTTP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const wsUrl =
    process.env.NEXT_PUBLIC_WS_URL?.trim() ?? "ws://localhost:4111/ws";
  if (wsUrl.startsWith("wss://")) {
    return wsUrl.replace(/^wss:\/\//, "https://").replace(/\/ws\/?$/, "");
  }
  if (wsUrl.startsWith("ws://")) {
    return wsUrl.replace(/^ws:\/\//, "http://").replace(/\/ws\/?$/, "");
  }
  return "http://127.0.0.1:4111";
}

export async function fetchActiveAgents(): Promise<PublicAgent[]> {
  const response = await fetch(`${backendHttpUrl()}/api/agents`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    agents?: PublicAgent[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load agents.");
  }
  return payload.agents ?? [];
}

export async function sendChatMessage(
  input: ChatRequest,
): Promise<ChatResponse> {
  const response = await fetch(`${backendHttpUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: input.agent_id ?? undefined,
      message: input.message,
      conversation_id: input.conversation_id ?? undefined,
    }),
  });
  const payload = (await response.json()) as ChatResponse & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Chat request failed.");
  }
  return {
    conversation_id: payload.conversation_id,
    reply: payload.reply,
  };
}
