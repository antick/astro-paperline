export const TIME_UNITS = {
  millisecondsPerMinute: 60_000
} as const;

export const SITE_SETTINGS = {
  features: {
    articleTableOfContents: true,
    demoBanner: true,
    repositoryLink: true
  },
  pagination: {
    postsPerPage: 5
  },
  homepage: {
    focusPostCount: 1,
    latestPostCount: 4,
    popularTagCount: 12
  },
  publishing: {
    scheduledPostMarginMinutes: 0
  },
  article: {
    readingTimeFallbackMinutes: 5,
    tableOfContents: {
      minimumItems: 2,
      minimumHeadingDepth: 2,
      maximumHeadingDepth: 4,
      mobileCollapsible: true,
      activeHeadingOffsetPixels: 152,
      bottomActivationOffsetPixels: 24
    }
  }
} as const;
