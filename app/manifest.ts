import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MC-Todo | Modern Task Management",
    short_name: "MC-Todo",
    description:
      "A modern, high-performance To-Do List application built with Next.js",
    start_url: "/",
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#f97316",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
