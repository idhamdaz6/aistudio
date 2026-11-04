import { Mp3Encoder } from '@breezystack/lamejs';

// Helper to decode Base64 string to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  // Clean header if present
  const cleanBase64 = base64.replace(/^data:audio\/\w+;base64,/, '');
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert AudioBuffer to 16-bit PCM Int16Array
function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
  const l = buffer.length;
  const buf = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    buf[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return buf;
}

/**
 * Resample/time-adjust AudioBuffer to target playback speed using OfflineAudioContext.
 * If targetSpeed is 1.0, returns the original AudioBuffer directly.
 */
export async function adjustAudioBufferSpeed(
  audioBuffer: AudioBuffer,
  speed: number
): Promise<AudioBuffer> {
  if (Math.abs(speed - 1.0) < 0.01) {
    return audioBuffer;
  }

  // Calculate new duration
  const newDuration = audioBuffer.duration / speed;
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = Math.ceil(newDuration * sampleRate);

  const offlineCtx = new OfflineAudioContext(numberOfChannels, length, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = speed;

  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer;
}

/**
 * Encode an AudioBuffer into MP3 Blob using @breezystack/lamejs
 */
export function encodeAudioBufferToMp3(
  audioBuffer: AudioBuffer,
  kbps = 160
): Blob {
  const channels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);

  const leftChannel = audioBuffer.getChannelData(0);
  const leftInt16 = convertFloat32ToInt16(leftChannel);

  let rightInt16: Int16Array | undefined;
  if (channels === 2) {
    const rightChannel = audioBuffer.getChannelData(1);
    rightInt16 = convertFloat32ToInt16(rightChannel);
  }

  const mp3Data: Uint8Array[] = [];
  const sampleBlockSize = 1152;

  for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    let chunk: Uint8Array;

    if (channels === 2 && rightInt16) {
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      chunk = encoder.encodeBuffer(leftChunk, rightChunk);
    } else {
      chunk = encoder.encodeBuffer(leftChunk);
    }

    if (chunk && chunk.length > 0) {
      mp3Data.push(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.length));
    }
  }

  const endBuf: Uint8Array = encoder.flush();
  if (endBuf && endBuf.length > 0) {
    mp3Data.push(new Uint8Array(endBuf.buffer, endBuf.byteOffset, endBuf.length));
  }

  return new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' });
}

/**
 * Convert Base64 WAV or ArrayBuffer to AudioBuffer
 */
export async function decodeAudioData(
  input: string | ArrayBuffer | Uint8Array,
  audioContext?: AudioContext
): Promise<AudioBuffer> {
  const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
  let arrayBuffer: ArrayBuffer;

  if (typeof input === 'string') {
    const uint8 = base64ToUint8Array(input);
    arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
  } else if (input instanceof Uint8Array) {
    arrayBuffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  } else {
    arrayBuffer = input;
  }

  return await ctx.decodeAudioData(arrayBuffer.slice(0));
}

/**
 * High-level helper: convert base64 audio directly to MP3 Blob
 */
export async function convertBase64WavToMp3Blob(
  base64Wav: string,
  targetSpeed = 1.0,
  kbps = 160
): Promise<{ blob: Blob; duration: number }> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const originalBuffer = await decodeAudioData(base64Wav, audioContext);
    const speedAdjustedBuffer = await adjustAudioBufferSpeed(originalBuffer, targetSpeed);
    const mp3Blob = encodeAudioBufferToMp3(speedAdjustedBuffer, kbps);
    return {
      blob: mp3Blob,
      duration: speedAdjustedBuffer.duration,
    };
  } finally {
    if (audioContext.state !== 'closed') {
      audioContext.close();
    }
  }
}

/**
 * Trigger file download in browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}
