import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Darul Arqam",
    short_name: "Darul Arqam",
    description: "Lecture et analyse numérique du Coran par guématrie arabe.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F5EC",
    theme_color: "#0B6B3A",
    lang: "fr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
