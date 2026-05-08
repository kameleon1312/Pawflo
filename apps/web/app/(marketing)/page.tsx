import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/HeroSection';
import { PillarsSection } from '@/components/marketing/PillarsSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { UspSection } from '@/components/marketing/UspSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { B2bSection } from '@/components/marketing/B2bSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { WaitlistSection } from '@/components/marketing/WaitlistSection';

export const metadata: Metadata = {
  title: 'PawFlo — Znajdź soulmate\'a dla swojego psa',
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PillarsSection />
      <HowItWorksSection />
      <UspSection />
      <TestimonialsSection />
      <B2bSection />
      <PricingSection />
      <WaitlistSection />
    </>
  );
}
