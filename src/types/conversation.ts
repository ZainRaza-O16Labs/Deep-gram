export enum ConversationStatus {
  Idle = "idle",
  Connecting = "connecting",
  Listening = "listening",
  Thinking = "thinking",
  Speaking = "speaking",
  Disconnected = "disconnected",
  Error = "error",
}

export enum SpeakerRole {
  User = "user",
  Assistant = "assistant",
}

export interface TranscriptEntry {
  id: string;
  role: SpeakerRole;
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export type ClientToServerMessage =
  | { type: "start_session"; speakModel?: string; elevenLabsVoiceId?: string }
  | { type: "stop_session" }
  | { type: "audio"; data: string };

export type ServerToClientMessage =
  | { type: "session_started"; sessionId: string }
  | { type: "session_stopped" }
  | { type: "status"; status: ConversationStatus }
  | { type: "user_started_speaking" }
  | {
      type: "transcript";
      role: SpeakerRole;
      text: string;
      isFinal: boolean;
      entryId: string;
    }
  | { type: "audio"; data: string; sampleRate: number }
  | { type: "error"; message: string }
  | { type: "pong" };
