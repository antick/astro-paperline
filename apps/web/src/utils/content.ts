import { getCollection } from 'astro:content';
import getSortedPosts from './getSortedPosts';
import { getPostPath } from './post';

export async function getAllPosts() {
  const posts = getSortedPosts(await getCollection('blog'));
  const owners = new Map<string, string>();
  for (const post of posts) {
    const path = getPostPath(post);
    const existing = owners.get(path);
    if (existing) {
      throw new Error(
        `Duplicate published post path ${path}: ${existing} and ${post.id}. Set unique slugs.`
      );
    }
    owners.set(path, post.id);
  }
  return posts;
}
