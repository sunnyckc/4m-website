import type { APIRoute } from 'astro';

function getBackendBaseUrl(): string {
  const raw = import.meta.env.API_INTERNAL_URL || 'https://4m-backend-production.up.railway.app';
  return raw.replace(/\/$/, '');
}

function buildUpstreamUrl(url: URL, pathParam?: string): string {
  const backendBase = getBackendBaseUrl();
  const path = (pathParam || '').replace(/^\/+/, '');
  const target = new URL(`${backendBase}/${path}`);
  target.search = url.search;
  return target.toString();
}

async function proxyRequest(request: Request, url: URL, pathParam?: string): Promise<Response> {
  const upstreamUrl = buildUpstreamUrl(url, pathParam);
  const method = request.method.toUpperCase();
  const upstream = await fetch(upstreamUrl, {
    method,
    headers: {
      Accept: request.headers.get('accept') || 'application/json',
      'Content-Type': request.headers.get('content-type') || 'application/json',
    },
    body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
    signal: request.signal,
    redirect: 'manual',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'cache-control': upstream.headers.get('cache-control') || 'no-store',
    },
  });
}

export const ALL: APIRoute = async ({ request, url, params }) => {
  return proxyRequest(request, url, params.path);
};
