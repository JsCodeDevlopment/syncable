import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/reports/'],
    },
    sitemap: 'https://syncable-v2.vercel.app/sitemap.xml',
  }
}
