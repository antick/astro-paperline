import { SITE_SETTINGS } from '@settings';

const getPageNumbers = (numberOfPosts: number) => {
  const numberOfPages = numberOfPosts / SITE_SETTINGS.pagination.postsPerPage;

  let pageNumbers: number[] = [];
  for (let i = 1; i <= Math.ceil(numberOfPages); i++) {
    pageNumbers = [...pageNumbers, i];
  }

  return pageNumbers;
};

export default getPageNumbers;
