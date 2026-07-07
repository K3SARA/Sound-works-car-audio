import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/business";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS.name,
    short_name: "Sound Works",
    description: "Inventory, billing, and warranty management for Sound Works Car Audio.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#dc2626",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
