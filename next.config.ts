import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Point next-intl to your custom request configuration path 📂
const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {
  // Your existing Next.js configuration options go here
};

export default withNextIntl(nextConfig);