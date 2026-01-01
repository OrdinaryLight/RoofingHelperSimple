/** @type {import('next').NextConfig} */
const nextConfig = {
    // App directory is enabled by default in Next.js 14+
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "maps.googleapis.com",
                port: "",
                pathname: "/maps/api/staticmap",
            },
        ],
    },
};

module.exports = nextConfig;
