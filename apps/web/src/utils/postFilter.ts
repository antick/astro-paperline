import { SITE_SETTINGS, TIME_UNITS } from '@settings';
import type { CollectionEntry } from 'astro:content';

const postFilter = ({ data }: CollectionEntry<'blog'>) => {
  const scheduledPostMargin =
    SITE_SETTINGS.publishing.scheduledPostMarginMinutes * TIME_UNITS.millisecondsPerMinute;
  const isPublishTimePassed =
    Date.now() >= new Date(data.publishDate).getTime() - scheduledPostMargin;

  return !data.draft && isPublishTimePassed;
};

export default postFilter;
