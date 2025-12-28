/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

module.exports = nextConfig;
