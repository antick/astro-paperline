import type { CollectionEntry } from 'astro:content';
import { getPopulatedCategories } from '../utils/post';

export interface NavigationItem {
  label: string;
  href: string;
  children: NavigationItem[];
}

export const utilityNavigation = [
  { label: 'About', href: '/about' },
  { label: 'Archive', href: '/archive' },
  { label: 'Links', href: '/links' },
  { label: 'Contact', href: '/contact' },
  { label: 'Search', href: '/search' }
] as const;

export function getTopicNavigation(posts: CollectionEntry<'blog'>[]): NavigationItem[] {
  return getPopulatedCategories(posts).map(({ title, slug, subcategories }) => ({
    label: title,
    href: `/categories/${slug}`,
    children: (subcategories ?? []).map((subcategory) => ({
      label: subcategory.title,
      href: `/categories/${slug}/sections/${subcategory.slug}`,
      children: subcategory.topics.map((topic) => ({
        label: topic.title,
        href: `/categories/${slug}/sections/${subcategory.slug}/${topic.slug}`,
        children: []
      }))
    }))
  }));
}

export const footerNavigation = [
  { label: 'Home', href: '/' },
  ...utilityNavigation,
  { label: 'Tags', href: '/tags' },
  { label: 'RSS', href: '/rss.xml' }
] as const;
