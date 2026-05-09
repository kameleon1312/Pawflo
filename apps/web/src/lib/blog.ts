import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  tags: string[];
  coverImage?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data } = matter(raw);

    return {
      slug,
      title: data['title'] as string,
      description: data['description'] as string,
      publishedAt: data['publishedAt'] as string,
      author: data['author'] as string,
      tags: (data['tags'] as string[]) ?? [],
      coverImage: data['coverImage'] as string | undefined,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data['title'] as string,
    description: data['description'] as string,
    publishedAt: data['publishedAt'] as string,
    author: data['author'] as string,
    tags: (data['tags'] as string[]) ?? [],
    coverImage: data['coverImage'] as string | undefined,
    content,
  };
}
