import { NextRequest, NextResponse } from 'next/server';
import { normalizeWeather, weatherUrl } from '@/lib/datasets';
import { SITES, TownshipId } from '@/lib/simulation';

export async function GET(request: NextRequest) {
  const township = request.nextUrl.searchParams.get('township') ?? 'elmina';
  const mode = request.nextUrl.searchParams.get('mode') ?? 'forecast';
  if (!Object.hasOwn(SITES, township) || !['historical', 'forecast'].includes(mode)) {
    return NextResponse.json({ error: 'Weather data is available for Elmina only. Choose historical or forecast mode.' }, { status: 400 });
  }
  const start = request.nextUrl.searchParams.get('start') ?? '2021-12-17';
  const end = request.nextUrl.searchParams.get('end') ?? '2021-12-19';
  if (mode === 'historical') {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const span = (Date.parse(end) - Date.parse(start)) / 86400000;
    if (!datePattern.test(start) || !datePattern.test(end) || !Number.isFinite(span) || span < 0 || span > 6 ||
      new Date(start).toISOString().slice(0, 10) !== start || new Date(end).toISOString().slice(0, 10) !== end ||
      Date.parse(start) < Date.parse('1940-01-01') || Date.parse(end) > Date.now() - 5 * 86400000) {
      return NextResponse.json({ error: 'Choose 1–7 valid historical days from 1940 through five days ago.' }, { status: 400 });
    }
  }
  const url = weatherUrl(township as TownshipId, mode as 'historical' | 'forecast', start, end);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), next: { revalidate: mode === 'forecast' ? 900 : 86400 } });
    if (!response.ok) throw new Error(`Weather service returned HTTP ${response.status}.`);
    const dataset = normalizeWeather(await response.json(), township as TownshipId, mode as 'historical' | 'forecast', url);
    return NextResponse.json(dataset);
  } catch {
    return NextResponse.json({ error: 'Weather service unavailable. Your current run is unchanged. Try the bundled offline rainfall replay.' }, { status: 502 });
  }
}
