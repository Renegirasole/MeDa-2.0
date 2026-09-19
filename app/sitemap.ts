import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/data/categories";
import { APPRAISALS } from "@/lib/data/appraisal";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    { path: "", priority: 1 },
    { path: "/calculadoras", priority: 0.9 },
    ...CATEGORIES.map((c) => ({ path: `/calculadoras/${c.slug}`, priority: 0.9 })),
    { path: "/viajes", priority: 0.8 },
    { path: "/comparar", priority: 0.8 },
    { path: "/tasador", priority: 0.7 },
    ...APPRAISALS.map((a) => ({ path: `/tasador/${a.slug}`, priority: 0.7 })),
    { path: "/combinar", priority: 0.5 },
    { path: "/como-calculamos", priority: 0.5 },
    { path: "/anunciate", priority: 0.3 },
  ];
  return paths.map((p) => ({ url: `${SITE.url}${p.path}`, lastModified: now, changeFrequency: "monthly", priority: p.priority }));
}
