/**
 * CloudFlare Worker : servir les fichiers SEO/GEO a la racine de qalia.ai
 *
 * Deploiement : CloudFlare Dashboard > Workers > Create > coller ce script
 * Route : *.qalia.ai/*
 *
 * Ce Worker intercepte les requetes vers /robots.txt, /sitemap.xml,
 * /llms.txt et /llms-full.txt, et renvoie le contenu correct.
 * Toutes les autres requetes passent a Systeme.io normalement.
 *
 * Mise a jour : 2026-04-11
 */

const ROBOTS_TXT = `# Robots.txt pour qalia.ai
# Mise a jour : 2026-04-11

User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Google-Agent
Allow: /

User-agent: bingbot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: MistralAI-User
Allow: /

User-agent: MistralAI-Index
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: meta-externalfetcher
Allow: /

User-agent: GrokBot
Allow: /

User-agent: Deepseekbot
Allow: /

User-agent: YouBot
Allow: /

User-agent: CCBot
Disallow: /

User-agent: cohere-ai
Disallow: /

User-agent: Bytespider
Disallow: /

Sitemap: https://www.qalia.ai/sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.qalia.ai/</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/affiliation</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/contact</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/decouverte</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/confidentialite</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/cookies</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/cgv</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/mentions-legales</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/llms.txt</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.qalia.ai/llms-full.txt</loc>
    <lastmod>2026-04-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

// Le contenu de llms.txt et llms-full.txt est trop long pour etre inline.
// On les sert depuis CloudFlare R2 ou KV.
// Alternative : les stocker dans KV (Workers KV) avec les cles "llms.txt" et "llms-full.txt".

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Fichiers SEO servis directement
    if (path === '/robots.txt') {
      return new Response(ROBOTS_TXT, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Robots-Tag': 'noindex',
        },
      });
    }

    if (path === '/sitemap.xml') {
      return new Response(SITEMAP_XML, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // llms.txt et llms-full.txt depuis KV (a configurer dans le dashboard)
    if (path === '/llms.txt' || path === '/llms-full.txt') {
      const key = path.substring(1); // "llms.txt" ou "llms-full.txt"

      // Si KV est configure, lire depuis KV
      if (env.SEO_FILES) {
        const content = await env.SEO_FILES.get(key);
        if (content) {
          return new Response(content, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      }

      // Fallback : renvoyer une redirection vers le fichier sur le domaine
      return new Response(`Fichier ${key} non configure dans KV. Configurer env.SEO_FILES.`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // HSTS header sur toutes les reponses
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
