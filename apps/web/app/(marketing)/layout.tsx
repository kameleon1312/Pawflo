import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeShell } from '@/components/layout/ThemeShell';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeShell>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </ThemeShell>
  );
}
