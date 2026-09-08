import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const lastModified = new Date("2026-09-08");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/empleo-publico/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
