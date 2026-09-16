import { NextRequest, NextResponse } from 'next/server';

// Same-origin bridge: retain the backend's httpOnly viewer/day receipt even when
// the public API is configured on a different origin. GET/prefetch never writes.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id))
    return NextResponse.json({ error: 'Invalid article' }, { status: 400 });
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  if (
    /prefetch|prerender/i.test(
      `${request.headers.get('purpose')} ${request.headers.get('sec-purpose')}`,
    ) ||
    request.headers.has('next-router-prefetch')
  )
    return NextResponse.json({ counted: false });
  const configured =
    process.env.API_BASE_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) return NextResponse.json({ error: 'View service unavailable' }, { status: 503 });
  const base = new URL(configured.replace(/\/$/, '') + '/', request.url);
  const endpoint = new URL(`v1/news/${id}/view`, base);
  try {
    const receipt = request.cookies.get('nv');
    const response = await fetch(endpoint, {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: receipt ? { cookie: `nv=${encodeURIComponent(receipt.value)}` } : {},
    });
    const result = new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
    const cookie = response.headers.get('set-cookie');
    if (cookie) result.headers.set('set-cookie', cookie);
    return result;
  } catch {
    return NextResponse.json({ error: 'View service unavailable' }, { status: 503 });
  }
}
