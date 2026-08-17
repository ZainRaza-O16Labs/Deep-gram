"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMicrophoneStream,
  playPcmBase64,
  type MicrophoneStream,
} from "@/services/audio";
import {
  ConversationStatus,
  SpeakerRole,
  type ClientToServerMessage,
  type ServerToClientMessage,
  type TranscriptEntry,
} from "@/types/conversation";

const DEFAULT_WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/ws";

function cleanAssistantText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .trim();
}

function mergeTranscriptEntry(
  previous: TranscriptEntry[],
  next: Omit<TranscriptEntry, "timestamp"> & { timestamp?: number },
): TranscriptEntry[] {
  const existingIndex = previous.findIndex((entry) => entry.id === next.id);

  // Completely new entry
  if (existingIndex === -1) {
    return [
      ...previous,
      {
        ...next,
        timestamp: next.timestamp ?? Date.now(),
      },
    ];
  }

  const current = previous[existingIndex];

  if (!current) {
    return previous;
  }

  // Final messages should NEVER overwrite an already-final message.
  // Deepgram can emit multiple final assistant messages with the same id.
  if (
    current.isFinal &&
    next.isFinal &&
    current.role === SpeakerRole.Assistant &&
    next.role === SpeakerRole.Assistant &&
    current.text !== next.text
  ) {
    return [
      ...previous,
      {
        ...next,
        id: crypto.randomUUID(),
        timestamp: next.timestamp ?? Date.now(),
      },
    ];
  }

  const updated = [...previous];

  updated[existingIndex] = {
    ...current,
    text: next.text,
    isFinal: next.isFinal,
  };

  return updated;
}

export function useVoiceConversation() {
  // Hooks must stay in a fixed order — never insert refs/state between callbacks.
  const [status, setStatus] = useState<ConversationStatus>(
    ConversationStatus.Idle,
  );
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const micRef = useRef<MicrophoneStream | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef(0);
  const pcmLeftoverRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(0));
  const statusRef = useRef<ConversationStatus>(ConversationStatus.Idle);
  const shouldReconnectRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  /** Speak model chosen before Start; reused on reconnect. */
  const speakModelRef = useRef<string | undefined>(undefined);
  const elevenLabsVoiceIdRef = useRef<string | undefined>(undefined);

  const stopPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    pcmLeftoverRef.current = new Uint8Array(0);
  }, []);

  const cleanupMedia = useCallback(() => {
    micRef.current?.stop();
    micRef.current = null;
    stopPlayback();
    void playbackContextRef.current?.close();
    playbackContextRef.current = null;
  }, [stopPlayback]);

  const sendMessage = useCallback((message: ClientToServerMessage) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify(message));
  }, []);

  const ensureMicrophone = useCallback(async () => {
    if (micRef.current) {
      return;
    }

    const microphone = createMicrophoneStream((pcmBase64) => {
      sendMessage({ type: "audio", data: pcmBase64 });
    });

    await microphone.start();
    micRef.current = microphone;
  }, [sendMessage]);

  const handleServerMessage = useCallback(
    (message: ServerToClientMessage) => {
      switch (message.type) {
        case "session_started":
          setSessionId(message.sessionId);
          statusRef.current = ConversationStatus.Listening;
          setStatus(ConversationStatus.Listening);
          void ensureMicrophone();
          break;
        case "session_stopped":
          // Server may restart a session on the same socket. Keep the mic
          // if the user is still in a call, otherwise speech never goes out.
          if (!shouldReconnectRef.current) {
            statusRef.current = ConversationStatus.Idle;
            setStatus(ConversationStatus.Idle);
            setSessionId(null);
            cleanupMedia();
          }
          break;
        case "status":
          statusRef.current = message.status;
          setStatus(message.status);
          break;
        case "user_started_speaking":
          stopPlayback();
          break;
        case "clear_audio":
          stopPlayback();
          break;
        case "transcript":
          setTranscripts((previous) =>
            mergeTranscriptEntry(previous, {
              id: message.entryId,
              role: message.role,
              text:
                message.role === SpeakerRole.Assistant
                  ? cleanAssistantText(message.text)
                  : message.text,
              isFinal: message.isFinal,
            }),
          );
          break;
        case "audio": {
          if (!playbackContextRef.current) {
            playbackContextRef.current = new AudioContext();
          }

          const context = playbackContextRef.current;
          if (context.state === "suspended") {
            void context.resume();
          }

          const { source, endTime, leftover } = playPcmBase64(
            message.data,
            message.sampleRate,
            context,
            nextPlayTimeRef.current,
            pcmLeftoverRef.current,
          );
          pcmLeftoverRef.current = leftover;
          nextPlayTimeRef.current = endTime;

          if (source) {
            activeSourcesRef.current.push(source);
            source.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter(
                (item) => item !== source,
              );
            };
          }
          break;
        }
        case "error":
          setErrorMessage(message.message);
          setStatus(ConversationStatus.Error);
          break;
        default:
          break;
      }
    },
    [cleanupMedia, ensureMicrophone, stopPlayback],
  );

  const connect = useCallback(() => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setStatus(ConversationStatus.Connecting);
    setErrorMessage(null);

    const socket = new WebSocket(DEFAULT_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptsRef.current = 0;
      sendMessage({
        type: "start_session",
        ...(speakModelRef.current
          ? { speakModel: speakModelRef.current }
          : {}),
        ...(elevenLabsVoiceIdRef.current
          ? { elevenLabsVoiceId: elevenLabsVoiceIdRef.current }
          : {}),
      });
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(
          String(event.data),
        ) as ServerToClientMessage;
        handleServerMessage(payload);
      } catch {
        setErrorMessage("Received an invalid message from the server.");
      }
    };

    socket.onerror = () => {
      setErrorMessage("Unable to reach the voice server.");
      setStatus(ConversationStatus.Error);
    };

    socket.onclose = () => {
      socketRef.current = null;
      stopPlayback();

      if (!shouldReconnectRef.current) {
        cleanupMedia();
        setStatus((current) =>
          current === ConversationStatus.Error
            ? current
            : ConversationStatus.Disconnected,
        );
        return;
      }

      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;

      if (attempt > 5) {
        shouldReconnectRef.current = false;
        setErrorMessage("Connection lost. Please start again.");
        setStatus(ConversationStatus.Error);
        return;
      }

      setStatus(ConversationStatus.Connecting);
      window.setTimeout(() => {
        connect();
      }, Math.min(1000 * attempt, 5000));
    };
  }, [cleanupMedia, handleServerMessage, sendMessage, stopPlayback]);

  const startConversation = useCallback(
    async (speakModel?: string, elevenLabsVoiceId?: string) => {
      try {
        speakModelRef.current = speakModel;
        elevenLabsVoiceIdRef.current = elevenLabsVoiceId;
        setTranscripts([]);
        setErrorMessage(null);
        shouldReconnectRef.current = true;

        await ensureMicrophone();
        connect();
      } catch (error) {
        const message =
          error instanceof Error && error.name === "NotAllowedError"
            ? "Microphone permission was denied."
            : "Unable to access the microphone.";
        setErrorMessage(message);
        setStatus(ConversationStatus.Error);
        shouldReconnectRef.current = false;
        cleanupMedia();
      }
    },
    [cleanupMedia, connect, ensureMicrophone],
  );

  const stopConversation = useCallback(() => {
    shouldReconnectRef.current = false;
    sendMessage({ type: "stop_session" });
    cleanupMedia();

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setSessionId(null);
    setStatus(ConversationStatus.Idle);
  }, [cleanupMedia, sendMessage]);

  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      cleanupMedia();
      socketRef.current?.close();
    };
  }, [cleanupMedia]);

  return {
    status,
    transcripts,
    errorMessage,
    sessionId,
    isListening: status === ConversationStatus.Listening,
    isSpeaking: status === ConversationStatus.Speaking,
    isUserTurn:
      status === ConversationStatus.Listening ||
      transcripts.some(
        (entry) => entry.role === SpeakerRole.User && !entry.isFinal,
      ),
    startConversation,
    stopConversation,
  };
}
