import type { MetadataRoute } from "next";
import { SITE_URL } from "lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

const LASTMOD = new Date().toISOString().slice(0, 10);

const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/vehicles", changeFrequency: "daily", priority: 0.9 },
  { path: "/vehicles/v-arkana", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-tucson", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-208", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-cclass", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-duster", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-golf", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-corolla", changeFrequency: "weekly", priority: 0.8 },
  { path: "/vehicles/v-x3", changeFrequency: "weekly", priority: 0.8 },
  { path: "/booking", changeFrequency: "weekly", priority: 0.7 },
  { path: "/follow", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`,
    lastModified: LASTMOD,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
