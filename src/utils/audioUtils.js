import { encodeAudioBuffer } from './audioEncoder';

export async function audioBufferToFormat(buffer, format = 'mp3') {
  return await encodeAudioBuffer(buffer, format);
}

export async function audioBufferToWav(buffer) {
  return await encodeAudioBuffer(buffer, 'wav');
}

export async function audioBufferToMp3(buffer, kbps = 192) {
  return await encodeAudioBuffer(buffer, 'mp3', kbps);
}