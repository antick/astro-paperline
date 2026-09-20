import { LOCALE } from '../config';

export const getFormattedDate = (date: string | number | Date) =>
  date
    ? new Date(date).toLocaleDateString(LOCALE.dateLocale, {
        timeZone: LOCALE.timeZone,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

export const hasUpdatedDate = (published: string | Date, updated?: string | Date | null) =>
  Boolean(updated && new Date(updated).getTime() > new Date(published).getTime());

/** Check if an Image Path is Relative or Absolute */
export const checkImageUrl = (image: string | URL, url: string | URL | undefined) => {
  try {
    new URL(image);
    return image;
  } catch {
    return new URL(image, url).toString();
  }
};
