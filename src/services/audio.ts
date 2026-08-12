const SAMPLE_RATE = 16000;

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
    view.setInt16(
      index * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  return buffer;
}

function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
): Float32Array {
  if (outputSampleRate === inputSampleRate) {
    return buffer;
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;

    for (
      let index = offsetBuffer;
      index < nextOffsetBuffer && index < buffer.length;
      index += 1
    ) {
      accum += buffer[index] ?? 0;
      count += 1;
    }

    result[offsetResult] = accum / count;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

export interface MicrophoneStream {
  start: () => Promise<void>;
  stop: () => void;
  setMuted: (muted: boolean) => void;
}

export function createMicrophoneStream(
  onAudioChunk: (pcmBase64: string) => void,
): MicrophoneStream {
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let silentGain: GainNode | null = null;
  let muted = false;

  return {
    async start() {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioContext = new AudioContext();
      source = audioContext.createMediaStreamSource(mediaStream);
      processor = audioContext.createScriptProcessor(4096, 1, 1);
      // Keep the processor alive without playing mic into the speakers (echo).
      silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      processor.onaudioprocess = (event) => {
        if (muted) {
          return;
        }

        const input = event.inputBuffer.getChannelData(0);
        const downsampled = downsampleBuffer(
          input,
          audioContext?.sampleRate ?? SAMPLE_RATE,
          SAMPLE_RATE,
        );
        const pcm = floatTo16BitPCM(downsampled);
        const bytes = new Uint8Array(pcm);
        let binary = "";

        for (let index = 0; index < bytes.length; index += 1) {
          binary += String.fromCharCode(bytes[index] ?? 0);
        }

        onAudioChunk(btoa(binary));
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);
    },
    setMuted(nextMuted: boolean) {
      muted = nextMuted;
    },
    stop() {
      processor?.disconnect();
      source?.disconnect();
      silentGain?.disconnect();
      void audioContext?.close();
      mediaStream?.getTracks().forEach((track) => track.stop());
      processor = null;
      source = null;
      silentGain = null;
      audioContext = null;
      mediaStream = null;
    },
  };
}

export interface PcmPlaybackResult {
  source: AudioBufferSourceNode | null;
  /** Absolute AudioContext time when this chunk finishes (for queueing). */
  endTime: number;
  /** Odd trailing byte to prepend on the next chunk (stream alignment). */
  leftover: Uint8Array<ArrayBuffer>;
}

/**
 * Decode linear16 PCM and schedule it after `startAt` so streamed chunks
 * play back-to-back instead of all overlapping at once.
 */
export function playPcmBase64(
  base64Audio: string,
  sampleRate: number,
  audioContext: AudioContext,
  startAt: number,
  leftoverBytes: Uint8Array = new Uint8Array(0),
): PcmPlaybackResult {
  const binary = atob(base64Audio);
  const incoming = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    incoming[index] = binary.charCodeAt(index);
  }

  const combined = new Uint8Array(leftoverBytes.length + incoming.length);
  combined.set(leftoverBytes);
  combined.set(incoming, leftoverBytes.length);

  const usableLength = combined.length - (combined.length % 2);
  // Copy so leftover is always ArrayBuffer-backed (TS 5.7+/DOM lib strictness).
  const leftover: Uint8Array<ArrayBuffer> = new Uint8Array(
    combined.subarray(usableLength),
  );

  if (usableLength === 0) {
    return { source: null, endTime: startAt, leftover };
  }

  const sampleCount = usableLength / 2;
  const floatSamples = new Float32Array(sampleCount);
  const view = new DataView(
    combined.buffer,
    combined.byteOffset,
    usableLength,
  );

  for (let index = 0; index < sampleCount; index += 1) {
    const intSample = view.getInt16(index * 2, true);
    floatSamples[index] = intSample / 0x8000;
  }

  const buffer = audioContext.createBuffer(1, floatSamples.length, sampleRate);
  buffer.copyToChannel(floatSamples, 0);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  // Schedule after previous chunk; apply small 30ms jitter buffer if starting new utterance
  const now = audioContext.currentTime;
  const when = startAt > now ? startAt : now + 0.03;
  source.start(when);

  return {
    source,
    endTime: when + buffer.duration,
    leftover,
  };
}
