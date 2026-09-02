import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // El uploader de logo acepta archivos de hasta 2 MB; el límite por defecto
    // de body para Server Actions es 1 MB. Dejamos margen para el overhead
    // de multipart/form-data.
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
