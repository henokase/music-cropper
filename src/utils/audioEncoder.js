export function encodeAudioBuffer(buffer, format = 'mp3', kbps = 192) {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(
        new URL('../workers/audioEncoder.worker.js', import.meta.url),
        { type: 'module' }
      );

      const channels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const sampleLength = buffer.length;

      const leftData = buffer.getChannelData(0);
      const rightData = channels > 1 ? buffer.getChannelData(1) : leftData;

      worker.onmessage = (e) => {
        const { type, blob, error } = e.data;
        worker.terminate();
        if (type === 'SUCCESS') {
          resolve(blob);
        } else {
          reject(new Error(error || 'Worker encoding failed'));
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };

      worker.postMessage({
        channels,
        sampleRate,
        sampleLength,
        leftData,
        rightData,
        format,
        kbps,
      });
    } catch (err) {
      reject(err);
    }
  });
}
