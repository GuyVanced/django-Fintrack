/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["localhost", "cdn.builder.io", "*.railway.app"],
    },
    serverExternalPackages: ["@tanstack/react-query"],
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    // Temporarily disable ESLint during build for deployment
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;