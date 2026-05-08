import { create } from 'zustand';
import type { DogSex, DogSize, ActivityLevel } from '@pawflo/types';

interface OnboardingDog {
  name: string;
  breed: string;
  sex: DogSex | null;
  size: DogSize | null;
  birthYear: number | null;
  activityLevel: ActivityLevel | null;
  traits: string[];
}

interface OnboardingState {
  dog: OnboardingDog;
  setStep1: (data: Pick<OnboardingDog, 'name' | 'breed' | 'sex' | 'size' | 'birthYear'>) => void;
  setStep3: (data: Pick<OnboardingDog, 'activityLevel' | 'traits'>) => void;
  reset: () => void;
}

const defaultDog: OnboardingDog = {
  name: '',
  breed: '',
  sex: null,
  size: null,
  birthYear: null,
  activityLevel: null,
  traits: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  dog: { ...defaultDog },
  setStep1: (data) => set((s) => ({ dog: { ...s.dog, ...data } })),
  setStep3: (data) => set((s) => ({ dog: { ...s.dog, ...data } })),
  reset: () => set({ dog: { ...defaultDog } }),
}));
