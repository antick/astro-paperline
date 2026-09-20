/** Theme attribution, separate from the publication's author and social links. */
const portfolio = 'https://sanam.id/';

export const CREATOR = {
  name: 'Sanam',
  creditPrefix: 'Made with',
  creditBy: 'by',
  bio: 'I’m Pankaj Sanam, an engineer who builds products and tools for the web. I write about engineering, the tools I use, and what I learn along the way.',
  portfolio,
  links: [
    { label: 'Personal site', href: portfolio },
    { label: 'GitHub', href: 'https://github.com/antick' }
  ]
} as const;
