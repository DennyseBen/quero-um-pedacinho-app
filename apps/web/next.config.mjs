/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
    transpilePackages: ['@pedacinho/shared'],
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
