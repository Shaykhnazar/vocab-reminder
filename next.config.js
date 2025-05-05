/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
      },
      {
        protocol: "https",
        hostname: "api.resend.com", // Replace with your S3 bucket name
        port: "", // Leave empty for default port
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Added Unsplash
        port: "",
      },
      {
        protocol: "https",
        hostname: "drive.google.com", // Added Google Drive
        port: "",
      },
    ],
  }
};

const withNextIntl = require('next-intl/plugin')(
    './i18n.ts'
);

module.exports = withNextIntl(nextConfig);
