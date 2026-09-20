import type { CollectionEntry } from 'astro:content';
import { categories } from '@data/category';
import { slugifyStr } from './slugify';

type BlogPost = CollectionEntry<'blog'>;
interface PostIdentity {
  id: string;
  data: {
    slug?: string;
  };
}

export function getPostSlug(post: PostIdentity) {
  return (
    post.data.slug ?? slugifyStr((post.id.split('/').at(-1) ?? post.id).replace(/\.(md|mdx)$/, ''))
  );
}

export function getPostPath(post: PostIdentity) {
  return `/${getPostSlug(post)}`;
}

export function getCategorySlug(category: string) {
  return slugifyStr(category);
}

export function getCategoryDetails(category: string) {
  const slug = getCategorySlug(category);
  const configuredCategory = categories.find((item) => item.slug === slug);

  if (!configuredCategory) throw new Error(`Unknown category: ${category}`);
  return configuredCategory;
}

/** Keep browse menus limited to taxonomy that has published stories. */
export function getPopulatedCategories(posts: readonly BlogPost[]) {
  return categories.flatMap((category) => {
    const matching = posts.filter((post) => getCategorySlug(post.data.category) === category.slug);
    if (!matching.length) return [];
    return [
      {
        ...category,
        subcategories: category.subcategories.flatMap((section) => {
          const sectionPosts = matching.filter((post) => post.data.subcategory === section.slug);
          if (!sectionPosts.length) return [];
          return [
            {
              ...section,
              topics: section.topics.filter((topic) =>
                sectionPosts.some((post) => post.data.topic === topic.slug)
              )
            }
          ];
        })
      }
    ];
  });
}

export function getPostImage(post: BlogPost) {
  return {
    light: post.data.ogImage ?? post.data.image,
    dark: post.data.ogImageDark,
    alt: post.data.ogImageAlt ?? post.data.title,
    width: post.data.ogImageWidth,
    height: post.data.ogImageHeight
  };
}
