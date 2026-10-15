import { create } from 'zustand';

// Ephemeral M0 shell state only, no durable domain model or persistence defaults.
interface ShellState {
  userPaused: boolean;
  togglePause: () => void;
}

export const useShellStore = create<ShellState>((set) => ({
  userPaused: false,
  togglePause: () => set((state) => ({ userPaused: !state.userPaused })),
}));
