import rss from '@astrojs/rss';
import { getAllPosts } from '@utils/content';
import { SITE } from '@config';
import { getPostPath } from '@utils/post';

export async function GET() {
  const sortedPosts = await getAllPosts();

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map((post) => ({
      link: getPostPath(post),
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.pubDate)
    }))
  });
}
