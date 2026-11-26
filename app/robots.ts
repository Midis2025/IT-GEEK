import type { MetadataRoute } from "next";
import { basePath, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: `${basePath}/api/` },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
