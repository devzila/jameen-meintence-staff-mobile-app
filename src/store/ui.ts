import { create } from 'zustand';

type UiState = {
  online: boolean;
  setOnline: (online: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  online: true,
  setOnline: (online) => set((state) => (state.online === online ? state : { online })),
}));
