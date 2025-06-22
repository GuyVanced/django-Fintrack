/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["localhost", "cdn.builder.io"],
    },
    serverExternalPackages: ["@tanstack/react-query"],
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has TypeScript errors.
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;