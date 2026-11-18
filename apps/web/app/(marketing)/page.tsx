import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/HeroSection';
import { PillarsSection } from '@/components/marketing/PillarsSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { UspSection } from '@/components/marketing/UspSection';
import { CommunitySection } from '@/components/marketing/CommunitySection';
import { B2bSection } from '@/components/marketing/B2bSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { WaitlistSection } from '@/components/marketing/WaitlistSection';

export const metadata: Metadata = {
  title: 'PawFlo — Wirtualny świat Twojego psa',
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PillarsSection />
      <HowItWorksSection />
      <UspSection />
      <CommunitySection />
      <B2bSection />
      <PricingSection />
      <WaitlistSection />
    </>
  );
}
