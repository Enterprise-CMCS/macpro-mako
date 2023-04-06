/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  trailingSlash: true,
  exportPathMap: async function () {
    return {
      "/": { page: "/" },
      "/posts": { page: "/posts" },
    };
  },
};

module.exports = nextConfig;
