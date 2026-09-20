import type { RemarkPlugin } from '@astrojs/markdown-remark';
import getReadingTime from 'reading-time';
import { toString as mdastToString } from 'mdast-util-to-string';

export const remarkReadingTime: RemarkPlugin = () => (tree, file) => {
  const frontmatter = file.data.astro?.frontmatter;
  if (!frontmatter) return;

  const textOnPage = mdastToString(tree);
  const readingTime = getReadingTime(textOnPage);

  frontmatter.estReadingTime = readingTime.minutes;
};
