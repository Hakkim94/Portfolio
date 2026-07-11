/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Enable static export
  output: 'export',
  
  // Disable image optimization (GitHub Pages doesn't support it)
  images: {
    unoptimized: true,
  },
  
  // Set basePath if your repo name is different from 'portfolio'
  // Change 'portfolio' to your actual repository name
  basePath: isProd ? '/portfolio' : '',
  assetPrefix: isProd ? '/portfolio/' : '',
  
  // Enable trailing slashes for better compatibility
  trailingSlash: true,
  
  // Ensure static files are handled correctly
  distDir: 'out',
};

module.exports = nextConfig;