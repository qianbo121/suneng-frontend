import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return NextResponse.redirect(new URL('/en/about', request.url), 308);
}

export function HEAD(request: Request) {
  return NextResponse.redirect(new URL('/en/about', request.url), 308);
}
