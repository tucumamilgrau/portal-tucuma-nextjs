import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de capa enviadas via painel admin ficam hospedadas na API (uploads locais).
    // Em produção, troque localhost:3001 pelo domínio real da API.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/uploads/**" },
    ],
    // Next 16 bloqueia por padrão otimizar imagens de upstreams que resolvem para IP
    // privado/loopback (proteção contra SSRF) — inclui a API local em dev (localhost:3001).
    // Em produção, com a API em um domínio público de verdade, essa flag deixa de ter efeito.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
