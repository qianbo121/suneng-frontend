import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function GET() {
  return new NextResponse('Not Found', { status: 404 });
}

export function HEAD() {
  return new NextResponse('Not Found', { status: 404 });
}
