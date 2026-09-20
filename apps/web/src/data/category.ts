export const CATEGORY_SLUGS = ['writing', 'design', 'journal'] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Topic {
  title: string;
  slug: string;
  description: string;
}

export interface Subcategory {
  title: string;
  slug: string;
  topics: Topic[];
}

export interface Props {
  title: string;
  slug: CategorySlug;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'pink';
  description: string;
  subcategories: Subcategory[];
}

export type Category = Props;

export const categories: Props[] = [
  {
    title: 'Writing',
    slug: 'writing',
    color: 'orange',
    description: 'Sample stories, reading notes, and a tour of the written page.',
    subcategories: [
      {
        title: 'The craft',
        slug: 'craft',
        topics: [
          {
            title: 'Typography',
            slug: 'typography',
            description: 'Type, rhythm, and the shape of a sentence.'
          }
        ]
      },
      {
        title: 'Markdown',
        slug: 'markdown',
        topics: [
          {
            title: 'Formatting',
            slug: 'formatting',
            description: 'Lists, code, and everyday publishing tools.'
          }
        ]
      },
      {
        title: 'Notebooks',
        slug: 'notebooks',
        topics: [
          {
            title: 'Observations',
            slug: 'observations',
            description: 'Reading notes and ideas worth keeping.'
          }
        ]
      }
    ]
  },
  {
    title: 'Design',
    slug: 'design',
    color: 'purple',
    description: 'Sample explorations of color, space, patterns, and comfortable reading.',
    subcategories: [
      {
        title: 'Visual design',
        slug: 'visual',
        topics: [
          {
            title: 'Palettes',
            slug: 'palettes',
            description: 'Color studies from everyday surroundings.'
          },
          { title: 'Layouts', slug: 'layouts', description: 'Space and balance on the page.' },
          { title: 'Patterns', slug: 'patterns', description: 'Small pieces that work together.' }
        ]
      },
      {
        title: 'Accessibility',
        slug: 'accessibility',
        topics: [
          {
            title: 'Reading',
            slug: 'reading',
            description: 'A comfortable reading experience in both themes.'
          }
        ]
      }
    ]
  },
  {
    title: 'Journal',
    slug: 'journal',
    color: 'green',
    description: 'Fictional walks and postcards that show how longer stories and images feel.',
    subcategories: [
      {
        title: 'Places',
        slug: 'places',
        topics: [
          { title: 'Walks', slug: 'walks', description: 'Small discoveries on imaginary paths.' },
          {
            title: 'The coast',
            slug: 'coast',
            description: 'Illustrated notes from an invented seaside town.'
          }
        ]
      }
    ]
  }
];
