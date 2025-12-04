/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Pode deixar false se estiver dando renderização dupla chata em dev
  
  // Isso faz o build ignorar erros de ESLint (regras de código)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Isso faz o build ignorar erros de Tipagem/TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Se você tiver problemas com imagens de domínios externos, configure aqui também
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;