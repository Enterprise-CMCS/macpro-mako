/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  exportPathMap: async function () {
    return {
      "/": { page: "/" },
      "/posts": { page: "/posts" },
    };
  },
};

module.exports = nextConfig;
