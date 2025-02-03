/** @type {import('next').NextConfig} */
const { DeleteSourceMapsPlugin } = require("webpack-delete-sourcemaps-plugin");

const nextConfig = {
  sentry: { hideSourceMaps: true },
  webpack: (config, { isServer }) => {
    devtool: "hidden-source-map", // optional, see the #hidden-source-map section for
      config.plugins.push(
        new DeleteSourceMapsPlugin({ isServer, keepServerSourcemaps: true })
      );
    return config;
  },
};

module.exports = nextConfig;
