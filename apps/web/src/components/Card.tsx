import type { CollectionEntry } from 'astro:content';
import { slugifyStr } from '@utils/slugify';
import Datetime from './Datetime';

export interface Props {
  href?: string;
  frontmatter: Pick<
    CollectionEntry<'blog'>['data'],
    'title' | 'publishDate' | 'excerpt' | 'updatedDate'
  >;
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, publishDate, excerpt, updatedDate } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: 'reading-font text-2xl font-semibold leading-snug tracking-tight hover:underline'
  };

  return (
    <li className="border-b border-skin-line py-7 last:border-b-0">
      <a
        href={href}
        className="inline-block text-skin-base underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? <h2 {...headerProps}>{title}</h2> : <h3 {...headerProps}>{title}</h3>}
      </a>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {excerpt}
      </p>
      <Datetime
        pubDatetime={publishDate}
        modDatetime={updatedDate}
        className="mt-3 text-xs text-gray-600 dark:text-gray-400"
      />
    </li>
  );
}
