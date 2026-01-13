// Supabase Edge Function: extract-article
// Extracts clean article content from URLs using Mozilla Readability

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Readability } from 'npm:@mozilla/readability@0.5.0';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

interface ArticleRequest {
  url: string;
}

interface ArticleResponse {
  url: string;
  title: string;
  content: string;
  excerpt: string;
  author?: string;
  siteName?: string;
  imageUrl?: string;
  length: number;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url }: ArticleRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the article
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScrollRead/2.0; +https://scrollread.app)',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch article: ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse HTML' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract article using Readability
    const reader = new Readability(doc as any);
    const article = reader.parse();

    if (!article) {
      return new Response(
        JSON.stringify({ error: 'Could not extract article content. The page may not be an article.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to extract site name from meta tags
    const siteName =
      doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="application-name"]')?.getAttribute('content') ||
      new URL(url).hostname;

    // Try to extract featured image
    const imageUrl =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      doc.querySelector('link[rel="image_src"]')?.getAttribute('href');

    const result: ArticleResponse = {
      url,
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt,
      author: article.byline,
      siteName,
      imageUrl,
      length: article.length,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting article:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
