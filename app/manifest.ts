import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "青年大学习",
    short_name: "青年大学习",
    description: "给第一次进入社会也会慌的年轻人，一个能直接照着做的社会生存技能学习工具。",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f2ea",
    theme_color: "#df7a58",
    lang: "zh-CN",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
