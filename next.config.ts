import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/login', destination: '/admin/login', permanent: true },
      { source: '/forgot-password', destination: '/admin/forgot-password', permanent: true },
      { source: '/reset-password', destination: '/admin/reset-password', permanent: true },
      { source: '/dashboard', destination: '/admin/dashboard', permanent: true },
      { source: '/bookings', destination: '/admin/bookings', permanent: true },
      { source: '/bookings/:path*', destination: '/admin/bookings/:path*', permanent: true },
      { source: '/vehicles', destination: '/admin/vehicles', permanent: true },
      { source: '/vehicles/:path*', destination: '/admin/vehicles/:path*', permanent: true },
      { source: '/calendar', destination: '/admin/calendar', permanent: true },
      { source: '/customers', destination: '/admin/customers', permanent: true },
      { source: '/drivers', destination: '/admin/drivers', permanent: true },
      { source: '/settings', destination: '/admin/settings', permanent: true },
    ];
  },
};

export default nextConfig;
