import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
  /** Las imágenes generadas (nota, carrusel) leen Geist del disco: que viaje con cada función. */
  outputFileTracingIncludes: { "/api/**": ["./assets/fonts/*.ttf"] },
  /** Dominio canónico: todo lo demás redirige a medaono.com. */
  async redirects() {
    return ["www.medaono.com", "meda-five.vercel.app"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://medaono.com/:path*",
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
