/* eslint no-undef: 0 */ // --> OFF

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: "./",
};

module.exports = {
  ...nextConfig,
};
