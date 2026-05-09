import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPost } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — PawFlo Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="flex gap-2 mb-4 flex-wrap">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-coral/20 text-coral"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-serif text-4xl font-bold text-cream mb-4">{post.title}</h1>
        <p className="text-bone text-lg mb-4">{post.description}</p>
        <div className="flex items-center gap-4 text-sm text-bone/60">
          <span>{post.author}</span>
          <span>·</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>

      {/* MDX Content */}
      <article className="prose prose-invert prose-coral max-w-none">
        <MDXRemote source={post.content} />
      </article>

      {/* CTA */}
      <div className="mt-16 p-8 rounded-2xl bg-coral/10 border border-coral/20 text-center">
        <p className="font-serif text-2xl font-bold text-cream mb-2">
          Dołącz do PawFlo
        </p>
        <p className="text-bone mb-6">
          Znajdź przyjaciela dla swojego psa już dziś.
        </p>
        <a
          href="/#waitlist"
          className="inline-block bg-coral text-cream font-bold px-8 py-3 rounded-full hover:bg-coralDeep transition-colors"
        >
          Zapisz się na listę oczekujących
        </a>
      </div>
    </main>
  );
}
