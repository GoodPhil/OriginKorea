import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://originkorea.kr';

  // Static routes that should be indexed
  const staticRoutes = [
    '',
    '/ai-analysis',
    '/analysis',
    '/announcements',
    '/bookmarks',
    '/calculator',
    '/community',
    '/comparison',
    '/contact',
    '/demo',
    '/docs',
    '/governance',
    '/invite',
    '/membership',
    '/whale-monitor',
  ];

  const currentDate = new Date();

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
