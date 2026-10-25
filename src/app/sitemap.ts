import type { MetadataRoute } from "next";
import { siteUrl } from "@/utils/site";

export default function sitemap(): MetadataRoute.Sitemap {
	return [{ url: `${siteUrl}/ja` }, { url: `${siteUrl}/en` }];
}
