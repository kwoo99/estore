import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

module.exports = {
  allowedDevOrigins: ['10.206.87.69', '192.168.68.111', '192.168.68.125']
}


export default nextConfig;
