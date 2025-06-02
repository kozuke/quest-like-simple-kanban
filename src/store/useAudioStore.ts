import { create } from 'zustand';

export type VolumeLevel = 'off' | 'low' | 'medium' | 'high';

interface AudioStore {
  volumeLevel: VolumeLevel;
  setVolumeLevel: (level: VolumeLevel) => void;
  getVolumeValue: () => number;
  cycleVolume: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const VOLUME_STORAGE_KEY = 'kanban-audio-settings';

const volumeLevels: VolumeLevel[] = ['off', 'low', 'medium', 'high'];

const getVolumeValue = (level: VolumeLevel): number => {
  switch (level) {
    case 'off': return 0;
    case 'low': return 0.2;
    case 'medium': return 0.4;
    case 'high': return 0.6;
    default: return 0.4;
  }
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  volumeLevel: 'medium',

  setVolumeLevel: (level: VolumeLevel) => {
    set({ volumeLevel: level });
    get().saveToLocalStorage();
  },

  getVolumeValue: () => {
    const { volumeLevel } = get();
    return getVolumeValue(volumeLevel);
  },

  cycleVolume: () => {
    const { volumeLevel } = get();
    const currentIndex = volumeLevels.indexOf(volumeLevel);
    const nextIndex = (currentIndex + 1) % volumeLevels.length;
    const nextLevel = volumeLevels[nextIndex];
    
    set({ volumeLevel: nextLevel });
    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    try {
      const { volumeLevel } = get();
      localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify({ volumeLevel }));
    } catch (error) {
      console.error('Failed to save audio settings to localStorage:', error);
    }
  },

  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.volumeLevel && volumeLevels.includes(parsed.volumeLevel)) {
          set({ volumeLevel: parsed.volumeLevel });
        }
      }
    } catch (error) {
      console.error('Failed to load audio settings from localStorage:', error);
    }
  },
})); 