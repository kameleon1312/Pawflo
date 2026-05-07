import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Regulamin' };

export default function RegulaminPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="font-serif font-bold text-ink text-4xl mb-8">Regulamin</h1>
      <p className="font-sans text-textMid">
        Treść regulaminu zostanie opublikowana przed startem aplikacji.
      </p>
    </div>
  );
}
