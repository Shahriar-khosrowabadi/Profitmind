import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const assets = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    pair: 'ETHBTC',
    vsCurrency: 'usd',
    currencyLabel: 'USD',
    iconUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    pair: 'BTCUSDT',
    vsCurrency: 'usd',
    currencyLabel: 'USD',
    iconUrl:
      'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'tether',
    name: 'Tether',
    symbol: 'USDT',
    pair: 'USDT',
    vsCurrency: 'usd',
    currencyLabel: 'USD',
    iconUrl:
      'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  },
] as const;

type CoinGeckoQuote = Record<string, number | undefined>;

type CoinGeckoResponse = Record<string, CoinGeckoQuote>;

const error = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const parseNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

export async function GET() {
  const apiKey =
    process.env.COINGECKO_API_KEY ??
    process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

  if (!apiKey) {
    return error('Missing COINGECKO_API_KEY in environment', 500);
  }

  const ids = assets.map((asset) => asset.id).join(',');
  const vsCurrencies = Array.from(
    new Set(assets.map((asset) => asset.vsCurrency))
  ).join(',');

  const query = new URLSearchParams({
    ids,
    vs_currencies: vsCurrencies,
    include_24hr_change: 'true',
  });

  try {
    const res = await fetch(`${COINGECKO_BASE}/simple/price?${query}`, {
      headers: {
        'x-cg-demo-api-key': apiKey,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return error(`CoinGecko returned ${res.status}`, res.status);
    }

    const payload = (await res.json()) as CoinGeckoResponse;

    const items = assets.map((asset) => {
      const quote = payload[asset.id] ?? {};
      const price = parseNumber(quote[asset.vsCurrency]);
      const change = parseNumber(
        quote[`${asset.vsCurrency}_24h_change`]
      );
      return {
        ...asset,
        price,
        change,
      };
    });

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      items,
    });
  } catch (err) {
    console.error('CoinGecko fetch failed', err);
    return error('Failed to reach CoinGecko API', 502);
  }
}
