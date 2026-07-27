import { Mp3Encoder } from '@breezystack/lamejs';

self.onmessage = function (e) {
  const { channels, sampleRate, sampleLength, leftData, rightData, format, kbps } = e.data;

  try {
    if (format === 'wav') {
      const blob = encodeWav(channels, sampleRate, sampleLength, leftData, rightData);
      self.postMessage({ type: 'SUCCESS', blob });
    } else {
      const blob = encodeMp3(channels, sampleRate, sampleLength, leftData, rightData, kbps || 192);
      self.postMessage({ type: 'SUCCESS', blob });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message || 'Encoding failed in worker thread' });
  }
};

function encodeMp3(channels, sampleRate, sampleLength, leftData, rightData, kbps) {
  const mp3encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const mp3Data = [];

  const leftInt16 = new Int16Array(sampleLength);
  const rightInt16 = new Int16Array(sampleLength);

  for (let i = 0; i < sampleLength; i++) {
    let sLeft = Math.max(-1, Math.min(1, leftData[i]));
    leftInt16[i] = sLeft < 0 ? sLeft * 0x8000 : sLeft * 0x7FFF;

    let sRight = Math.max(-1, Math.min(1, rightData[i]));
    rightInt16[i] = sRight < 0 ? sRight * 0x8000 : sRight * 0x7FFF;
  }

  const chunkSize = 1152;
  for (let i = 0; i < sampleLength; i += chunkSize) {
    const leftChunk = leftInt16.subarray(i, i + chunkSize);
    const rightChunk = rightInt16.subarray(i, i + chunkSize);
    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
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
