import { NextResponse } from 'next/server';

const TWELVE_DATA_BASE = 'https://api.twelvedata.com';

type AllowedSymbol = 'usd' | 'usd_xau';
type SupportedRange = 'day' | '1m' | '3m';

type TwelveValue = {
  datetime?: string;
  close?: string | number;
};

type TwelveResponse = {
  status?: string;
  message?: string;
  values?: TwelveValue[];
};

const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const parseNumber = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    if (!cleaned) return undefined;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : undefined;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseDateTime = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const normalized = value.replace(' ', 'T');
  const utc = Date.parse(`${normalized}Z`);
  if (!Number.isFinite(utc)) return undefined;
  return Math.floor(utc / 1000);
};

const mapSymbol = (symbol: AllowedSymbol) => {
  if (symbol === 'usd_xau') return 'XAU/USD';
  return 'USD/IRT';
};

const rangeConfig: Record<
  SupportedRange,
  { interval: string; outputsize: number }
> = {
  day: { interval: '5min', outputsize: 288 },
  '1m': { interval: '1day', outputsize: 30 },
  '3m': { interval: '1day', outputsize: 90 },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? 'usd') as AllowedSymbol;
  const range = (url.searchParams.get('range') ?? 'day') as SupportedRange;

  if (!['usd', 'usd_xau'].includes(symbol)) {
    return error('Unsupported symbol. Try usd or usd_xau.');
  }

  if (!['day', '1m', '3m'].includes(range)) {
    return error('Unsupported range. Try day, 1m or 3m.');
  }

  const apiKey =
    process.env.TWELVE_DATA_API_KEY ??
    process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return error('Missing TWELVE_DATA_API_KEY in environment', 500);
  }

  try {
    const { interval, outputsize } = rangeConfig[range];
    const twelveSymbol = mapSymbol(symbol);
    const query = new URLSearchParams({
      symbol: twelveSymbol,
      interval,
      outputsize: String(outputsize),
      timezone: 'UTC',
      format: 'JSON',
      apikey: apiKey,
    });

    const seriesRes = await fetch(`${TWELVE_DATA_BASE}/time_series?${query}`, {
      cache: 'no-store',
    });

    if (!seriesRes.ok) {
      return error(
        `Twelve Data time_series returned ${seriesRes.status}`,
        seriesRes.status
      );
    }

    const seriesJson = (await seriesRes.json()) as TwelveResponse;
    if (seriesJson.status === 'error') {
      return error(seriesJson.message ?? 'Twelve Data error', 502);
    }

    const values = Array.isArray(seriesJson.values) ? seriesJson.values : [];
    const series = values
      .map((pt) => {
        const time = parseDateTime(pt.datetime);
        const value = parseNumber(pt.close);
        if (time === undefined || value === undefined) return null;
        return { time, value };
      })
      .filter(Boolean) as { time: number; value: number }[];

    if (!series.length) {
      return error('No data returned from Twelve Data', 502);
    }

    series.sort((a, b) => a.time - b.time);
    const latestPoint = series[series.length - 1];
    const price = latestPoint.value;
    const timestamp = latestPoint.time;

    return NextResponse.json({
      symbol,
      range,
      latest: {
        price,
        timestamp,
      },
      series,
    });
  } catch (err) {
    console.error('Twelve Data fetch failed', err);
    return error('Failed to reach Twelve Data API', 502);
  }
}
