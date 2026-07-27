import { createMp3Encoder } from 'wasm-media-encoders';

self.onmessage = async function (e) {
  const { channels, sampleRate, sampleLength, leftData, rightData, format, kbps } = e.data;

  try {
    if (format === 'wav') {
      const blob = encodeWav(channels, sampleRate, sampleLength, leftData, rightData);
      self.postMessage({ type: 'SUCCESS', blob });
    } else {
      const blob = await encodeMp3Wasm(channels, sampleRate, sampleLength, leftData, rightData, kbps || 192);
      self.postMessage({ type: 'SUCCESS', blob });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message || 'Encoding failed in WASM worker thread' });
  }
};

async function encodeMp3Wasm(channels, sampleRate, sampleLength, leftData, rightData, kbps) {
  // Create a clean instance per encoding request to prevent state contamination or heap corruption
  const encoder = await createMp3Encoder();

  encoder.configure({
    sampleRate: sampleRate,
    channels: channels,
    bitrate: kbps,
  });

  const pcmBuffers = channels > 1 ? [leftData, rightData] : [leftData];
  
  // Encode in safe, manageable chunks of 44,100 samples (~1 second) to prevent WASM heap buffer overflow
  const chunkSize = 44100;
  const encodedChunks = [];

  for (let i = 0; i < sampleLength; i += chunkSize) {
    const end = Math.min(i + chunkSize, sampleLength);
    const leftChunk = leftData.subarray(i, end);
    const rightChunk = channels > 1 ? rightData.subarray(i, end) : leftChunk;
    const chunkBuffers = channels > 1 ? [leftChunk, rightChunk] : [leftChunk];

    const outChunk = encoder.encode(chunkBuffers);
    if (outChunk && outChunk.length > 0) {
      encodedChunks.push(outChunk);
    }
  }

  const flushedChunk = encoder.finalize();
  if (flushedChunk && flushedChunk.length > 0) {
    encodedChunks.push(flushedChunk);
  }

  return new Blob(encodedChunks, { type: 'audio/mp3' });
}

function encodeWav(channels, sampleRate, sampleLength, leftData, rightData) {
  const format = 1; // PCM
  const bitDepth = 16;
  const blockAlign = (channels * bitDepth) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleLength * blockAlign;

  const headerSize = 44;
  const wav = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(wav);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const offset = 44;
  for (let i = 0; i < sampleLength; i++) {
    const sLeft = Math.max(-1, Math.min(1, leftData[i]));
    const intLeft = sLeft < 0 ? sLeft * 0x8000 : sLeft * 0x7FFF;
    view.setInt16(offset + i * blockAlign, intLeft, true);

    if (channels > 1) {
      const sRight = Math.max(-1, Math.min(1, rightData[i]));
      const intRight = sRight < 0 ? sRight * 0x8000 : sRight * 0x7FFF;
      view.setInt16(offset + i * blockAlign + 2, intRight, true);
    }
  }

  return new Blob([wav], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
