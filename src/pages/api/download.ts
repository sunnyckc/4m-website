import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const source = url.searchParams.get('url')?.trim();
  const filenameRaw = url.searchParams.get('filename')?.trim() || 'manual.pdf';
  const filename = filenameRaw.replace(/[\r\n"]/g, '_');

  if (!source) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(source);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }

  if (!['http:', 'https:'].includes(sourceUrl.protocol)) {
    return new Response('Unsupported protocol', { status: 400 });
  }

  const upstream = await fetch(sourceUrl.toString(), { method: 'GET' });
  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to fetch file', { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
};

