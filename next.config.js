/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["localhost", "cdn.builder.io"],
    },
    serverExternalPackages: ["@tanstack/react-query"],
};

module.exports = nextConfig;