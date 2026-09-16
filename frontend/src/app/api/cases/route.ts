import { NextRequest, NextResponse } from 'next/server';
import { getCaseResults } from '@/lib/cases/server';
import { parseCaseQuery } from '@/lib/cases/query';

export function GET(request: NextRequest) {
  return NextResponse.json(getCaseResults(parseCaseQuery(request.nextUrl.searchParams)), {
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, follow' },
  });
}
