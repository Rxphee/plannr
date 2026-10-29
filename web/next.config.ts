import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    poweredByHeader: false,
    // The default position covers the bottom of the sidebar
    devIndicators: { position: "bottom-right" },
    // web/ has its own lockfile next to the one of the repository root, so Next.js must not infer the root itself
    outputFileTracingRoot: __dirname,
    turbopack: {
        root: __dirname,
    },
};

export default nextConfig;
