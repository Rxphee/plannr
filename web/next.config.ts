import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    poweredByHeader: false,
    // web/ has its own lockfile next to the one of the repository root, so Next.js must not infer the root itself
    outputFileTracingRoot: __dirname,
    turbopack: {
        root: __dirname,
    },
};

export default nextConfig;
