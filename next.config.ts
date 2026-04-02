import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from CloudFront and Contrib
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2qcctj8epnr7y.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "www.contrib.com",
      },
      {
        protocol: "http",
        hostname: "www.contrib.com",
      },
    ],
  },

  // Backward-compatible URL rewrites (old .html/.php URLs)
  async rewrites() {
    return [
      // Old .html URLs -> new routes
      { source: "/about.html", destination: "/about" },
      { source: "/contact.html", destination: "/contact" },
      { source: "/privacy.html", destination: "/privacy" },
      { source: "/terms.html", destination: "/terms" },
    ];
  },

  // 301 redirects for old PHP paths and subdomains
  async redirects() {
    return [
      // Old PHP file paths
      {
        source: "/about.php",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact.php",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/privacy.php",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/terms.php",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },
      // Domain partnership old paths
      {
        source: "/domain/index.php",
        destination: "/domain",
        permanent: true,
      },
      {
        source: "/domain/apply_form.php",
        destination: "/domain/apply",
        permanent: true,
      },
      {
        source: "/domain/apply_form2.php",
        destination: "/domain/apply",
        permanent: true,
      },
      {
        source: "/domain/about.php",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/domain/contact.php",
        destination: "/contact",
        permanent: true,
      },
      // Apps partnership old paths
      {
        source: "/apps/index.php",
        destination: "/apps",
        permanent: true,
      },
      {
        source: "/apps/apply_form.php",
        destination: "/apps/apply",
        permanent: true,
      },
      // Leaders partnership old paths
      {
        source: "/leaders/index.php",
        destination: "/leaders",
        permanent: true,
      },
      {
        source: "/leaders/apply_form.php",
        destination: "/leaders/apply",
        permanent: true,
      },
      // Product/service old paths
      {
        source: "/product-service/index.php",
        destination: "/product-service",
        permanent: true,
      },
      {
        source: "/product-service/apply_form.php",
        destination: "/product-service/apply",
        permanent: true,
      },
      // Legacy .html extensions for subdirectory pages
      {
        source: "/domain/about.html",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/domain/contact.html",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/domain/privacy.html",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/domain/terms.html",
        destination: "/terms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
