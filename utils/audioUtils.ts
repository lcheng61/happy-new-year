
let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    // iOS Safari often prefers 44.1k or 48k for the hardware context
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    sharedAudioCtx = new AudioContextClass();
  }
  return sharedAudioCtx;
}

/**
 * Robustly unlocks the AudioContext on iOS/Android.
 * Should be called inside a user interaction (click/touchstart)
 */
export async function unlockAudio(ctx: AudioContext): Promise<boolean> {
  // Cast state to string to avoid comparison errors with narrower inferred types
  if ((ctx.state as string) === 'running') return true;

  // 1. Resume the context
  await ctx.resume();

  // 2. Play a tiny bit of silence to 'prime' the hardware on iOS
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);

  // Cast state to string to avoid comparison errors with narrower inferred types
  return (ctx.state as string) === 'running';
}

export function decode(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/^data:audio\/\w+;base64,/, '').replace(/\s/g, '');
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function playRawPcm(base64Data: string) {
  const audioCtx = getAudioContext();
  await unlockAudio(audioCtx);

  try {
    const decodedBytes = decode(base64Data);
    // Note: TTS data is specifically 24000Hz
    const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
    
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    return source;
  } catch (err) {
    console.error("Error playing PCM audio:", err);
    throw err;
  }
}
