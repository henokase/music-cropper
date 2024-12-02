import { create } from 'zustand';

export const useAudioStore = create((set) => ({
  audioFile: null,
  setAudioFile: (file, duration) => {
    set({
      audioFile: {
        file,
        duration,
        intervals: [],
      },
    });
  },
  addInterval: (interval) =>
    set((state) => ({
      audioFile: state.audioFile
        ? {
            ...state.audioFile,
            intervals: [
              ...state.audioFile.intervals,
              { ...interval, id: crypto.randomUUID() },
            ],
          }
        : null,
    })),
  updateInterval: (id, interval) =>
    set((state) => ({
      audioFile: state.audioFile
        ? {
            ...state.audioFile,
            intervals: state.audioFile.intervals.map((i) =>
              i.id === id ? { ...i, ...interval } : i
            ),
          }
        : null,
    })),
  removeInterval: (id) =>
    set((state) => ({
      audioFile: state.audioFile
        ? {
            ...state.audioFile,
            intervals: state.audioFile.intervals.filter((i) => i.id !== id),
          }
        : null,
    })),
  clearAudio: () => set({ audioFile: null }),
})); 