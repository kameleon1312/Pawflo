import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/HeroSection';
import { PillarsSection } from '@/components/marketing/PillarsSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { WaitlistSection } from '@/components/marketing/WaitlistSection';

export const metadata: Metadata = {
  title: 'PawFlo — Znajdź soulmate\'a dla swojego psa',
};

export default function LandingPage() {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Trzy filary: MachDog · PawPanel · PawMap */}
      <PillarsSection />

      {/* 3. Jak to działa (3-step) */}
      <HowItWorksSection />

      {/* 4. Cennik */}
      <PricingSection />

      {/* 5. Waitlist CTA */}
      <WaitlistSection />
    </>
  );
}
