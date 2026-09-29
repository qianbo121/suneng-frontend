import { NextRequest, NextResponse } from 'next/server';

function isLoopback(hostname: string) {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}

function requestOrigin(request: NextRequest) {
  const host = request.headers.get('host');
  if (!host || !isLoopback(request.nextUrl.hostname)) return request.nextUrl.origin;

  // Next normalizes loopback IPs to localhost. Recover only the actual local
  // Host, with the same listener port/protocol; never trust forwarded headers.
  try {
    const actual = new URL(`${request.nextUrl.protocol}//${host}`);
    return isLoopback(actual.hostname) &&
      actual.host === host.toLowerCase() &&
      actual.port === request.nextUrl.port
      ? actual.origin
      : null;
  } catch {
    return null;
  }
}

// Local previews can reach the configured backend without allowing localhost on production CORS.
// Production still submits directly to its existing public inquiry endpoint.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse(null, { status: 404 });
  const origin = request.headers.get('origin');
  if (!origin || origin !== requestOrigin(request)) return new NextResponse(null, { status: 403 });

  const configured =
    process.env.API_BASE_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured)
    return NextResponse.json({ message: 'Inquiry service unavailable' }, { status: 503 });

  try {
    const endpoint = new URL(`${configured.replace(/\/$/, '')}/v2/custom-requirements`);
    const sameLocalListener =
      isLoopback(endpoint.hostname) &&
      isLoopback(request.nextUrl.hostname) &&
      endpoint.protocol === request.nextUrl.protocol &&
      endpoint.port === request.nextUrl.port;
    if (endpoint.origin === request.nextUrl.origin || sameLocalListener) {
      return NextResponse.json(
        { message: 'Inquiry backend must use a separate address' },
        { status: 503 },
      );
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Inquiry service unavailable' }, { status: 503 });
  }
}
