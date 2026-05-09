import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — PawFlo',
  description: 'Porady dla właścicieli psów: zdrowie, socjalizacja, bezpieczeństwo i więcej.',
  openGraph: {
    title: 'Blog PawFlo — Porady dla właścicieli psów',
    description: 'Porady dla właścicieli psów: zdrowie, socjalizacja, bezpieczeństwo i więcej.',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-cream mb-3">Blog PawFlo</h1>
      <p className="text-bone mb-12">Porady, inspiracje i wiedza dla właścicieli psów.</p>

      <div className="flex flex-col gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-white/10 pb-8">
            <div className="flex gap-2 mb-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-coral/20 text-coral"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="font-serif text-2xl font-bold text-cream hover:text-coral transition-colors mb-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-bone text-sm mb-3">{post.description}</p>
            <div className="flex items-center gap-4 text-xs text-bone/60">
              <span>{post.author}</span>
              <span>
                {new Date(post.publishedAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
