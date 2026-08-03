import type { MetadataRoute } from "next";
import { getCategories, getNews } from "@/lib/api";

const SITE_URL = "https://portaltucumamilgrau.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, news] = await Promise.all([
    getCategories(),
    getNews({ limit: 500 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/noticia/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...newsRoutes];
}
