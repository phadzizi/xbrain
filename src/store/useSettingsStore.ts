import { create } from 'zustand';
import { setMuted, loadMutedPreference, isMuted } from '../services/sound';

loadMutedPreference();

type SettingsStore = {
  soundEnabled: boolean;
  toggleSound: () => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: !isMuted(),
  toggleSound: () => {
    set((state) => {
      const next = !state.soundEnabled;
      setMuted(!next);
      return { soundEnabled: next };
    });
  },
}));
