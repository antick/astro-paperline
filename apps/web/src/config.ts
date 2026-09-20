import { BLOG_PLACEHOLDER_PUBLIC_PATH } from './constants/images';
import type { Site } from './types';

export const SITE: Site = {
  website: 'https://paperline.potion.sh/',
  author: 'Paperline',
  desc: 'An open-source Astro theme for thoughtful writing, with sample stories, typography, and original illustrations.',
  title: 'Paperline',
  ogImage: BLOG_PLACEHOLDER_PUBLIC_PATH
};

export const TEMPLATE_DEMO = {
  repositoryUrl: 'https://github.com/antick/astro-paperline',
  repositoryLabel: 'Paperline on GitHub',
  bannerLabel: 'About this template',
  message: 'Paperline is a free Astro blog template.',
  linkLabel: 'Get it on GitHub',
  dismissLabel: 'Dismiss template banner',
  storageKey: 'paperline-demo-banner-dismissed'
} as const;

export const HOME = {
  eyebrow: 'An open-source Astro theme',
  title: 'Good stories start with a little space.',
  description:
    'A quiet home for words and ideas. Explore sample stories, expressive typography, and thoughtful details, then make Paperline your own.',
  featuredLabel: 'Featured article',
  cardLabel: 'Worth a look',
  latestLabel: 'Latest articles',
  topicsLabel: 'Browse by topic',
  popularTagsLabel: 'Popular tags',
  surpriseLabel: 'Take a detour',
  surpriseDescription:
    'Not sure what to read next? Let Paperline pick something unexpected for you.',
  surpriseButtonLabel: 'Surprise me',
  browseArchiveLabel: 'Browse everything',
  sidebarLabel: 'More to explore'
} as const;

export const MASTHEAD = {
  label: 'Words, given room',
  menuLabel: 'Browse topics',
  overviewLabel: 'All',
  sectionOverviewLabel: 'All'
} as const;

export const ARTICLE = {
  tableOfContentsLabel: 'In this article',
  mobileTableOfContentsLabel: 'Table of contents',
  sectionLabel: 'section',
  sectionsLabel: 'sections',
  relatedLabel: 'Related articles',
  updatedLabel: 'Updated',
  backLabel: '← View all articles',
  archivePath: '/archive'
} as const;

export const TAXONOMY = {
  sectionDescriptionLabel: 'Stories from',
  emptyState: 'No published articles here yet.'
} as const;

export const LOCALE = { language: 'en', dateLocale: 'en-US', timeZone: 'UTC' } as const;

export const UI = {
  skipToContent: 'Skip to content',
  emptyPosts: 'No published articles yet. Check back soon.',
  searchTitle: 'Search',
  searchPrompt: 'Enter at least two characters to search.',
  searchDescription: 'Find an article by its title or description.',
  linksTitle: 'Links',
  emptyLinks: 'No links to share yet.',
  linksDescription: 'A few places to start exploring.'
} as const;

export const NOT_FOUND = {
  title: 'A page out of place.',
  eyebrow: '404 / Page not found',
  description:
    'This page may have moved, or the link took a wrong turn. There are still plenty of good stories waiting for you.',
  note: 'Not every detour is a dead end.',
  illustrationLabel: 'Missing from this edition',
  home: { label: 'Back to the front page', href: '/' },
  links: [
    { label: 'Browse the archive', description: 'Every story, in one place.', href: '/archive' },
    {
      label: 'Find something specific',
      description: 'Search for a word or an idea.',
      href: '/search'
    }
  ]
} as const;
