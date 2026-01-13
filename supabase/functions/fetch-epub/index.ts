// Supabase Edge Function to fetch ePub files from URLs
// This bypasses CORS restrictions by downloading server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format
    let epubUrl: URL;
    try {
      epubUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(epubUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Only HTTP/HTTPS URLs are allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching ePub from:', url);

    // Fetch the ePub file
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ScrollRead/2.0 (ePub Reader)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get the file as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/epub+zip';

    console.log('Successfully fetched ePub, size:', arrayBuffer.byteLength, 'bytes');

    // Return the ePub file as base64
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(
      JSON.stringify({
        success: true,
        data: base64,
        contentType,
        size: arrayBuffer.byteLength,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ePub:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to fetch ePub',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
