import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://custodynote.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/trial",
    "/buy",
    "/download",
    "/cloud-backup",
    "/how-it-works",
    "/changelog",
    "/support",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "weekly" : path === "/privacy" || path === "/terms" ? "yearly" : "monthly") as "weekly" | "monthly" | "yearly",
    priority: path === "" ? 1 : 0.8,
  }));
}
