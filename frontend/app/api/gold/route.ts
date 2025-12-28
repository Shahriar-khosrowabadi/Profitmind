import { NextResponse } from 'next/server';

export const revalidate = 0; // always fetch fresh

const GOLD_ENDPOINT = 'https://www.goldapi.io/api/XAU/USD';

export async function GET() {
  const apiKey =
    process.env.GOLDAPI_KEY ??
    process.env.NEXT_PUBLIC_GOLDAPI_KEY ??
    process.env.GOLD_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing GOLDAPI_KEY in environment' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(GOLD_ENDPOINT, {
      method: 'GET',
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const message = `GoldAPI responded with ${res.status}`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GoldAPI fetch failed', err);
    return NextResponse.json(
      { error: 'Failed to reach GoldAPI' },
      { status: 500 }
    );
  }
}
