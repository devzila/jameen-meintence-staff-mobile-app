import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { persistentStorage } from '@/services/persistentStorage';

type OnboardingState = {
  finished: boolean;
  hydrated: boolean;
  finish: () => void;
  reset: () => void;
};

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      finished: false,
      hydrated: false,
      finish: () => set({ finished: true }),
      reset: () => set({ finished: false }),
    }),
    {
      name: 'jameen.maintenance.onboarding',
      storage: createJSONStorage(() => persistentStorage),
      partialize: (state) => ({ finished: state.finished }),
      onRehydrateStorage: () => (state) => {
        useOnboarding.setState({ hydrated: true, finished: state?.finished ?? false });
      },
    },
  ),
);
