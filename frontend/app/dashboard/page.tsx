'use client';

import DashboardLayout, {
  GlassCard,
} from '@/app/components/dashboard/DashboardLayout';
import TradingViewChart from '@/app/components/dashboard/TradingViewChart';
import type {
  AssetSymbol,
  RangeOption,
} from '@/app/components/dashboard/TradingViewChart';
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

const DashboardPage = () => {
  const pools = [
    { label: 'Gold Pool', value: '$144,657.89', change: '+1.73%' },
    { label: 'Stable Yield', value: '$42,098.10', change: '+0.82%' },
    { label: 'Risk Guard', value: '$28,004.12', change: '-0.23%' },
  ];

  const quickStats = [
    { label: 'Balance', value: '$164,647.86', icon: Wallet2 },
    { label: 'Staked', value: '$58,224.12', icon: ShieldCheck },
    { label: 'Rewards (24h)', value: '$1,764.52', icon: TrendingUp },
  ];

  const bars = [45, 72, 82, 55, 96, 88, 64, 52, 48, 40];
  const [assetPrice, setAssetPrice] = useState<number | null>(null);
  const [assetChange, setAssetChange] = useState<number | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<AssetSymbol>('usd_xau');
  const selectedRange: RangeOption = '1m';
  const [refreshToken, setRefreshToken] = useState(0);

  const formattedAssetPrice = useMemo(() => {
    if (assetPrice === null) return 'Loading...';
    return `$${assetPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [assetPrice]);

  const formattedAssetChange = useMemo(() => {
    if (assetChange === null) return '';
    const sign = assetChange >= 0 ? '+' : '';
    return `${sign}${assetChange.toFixed(2)}%`;
  }, [assetChange]);

  const changeTone =
    assetChange === null
      ? 'text-[color:var(--dash-muted)]'
      : assetChange >= 0
      ? 'text-[var(--profit)]'
      : 'text-red-400';

  return (
    <DashboardLayout>
      <div className="grid xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[color:var(--dash-muted)]">
                  Portfolio value
                </p>
                <p className="text-2xl font-semibold">$165,564.58</p>
              </div>
              <span className="text-xs text-[var(--profit)] bg-[var(--profit)]/10 px-2 py-1 rounded-full">
                +8.35%
              </span>
            </div>

            <div className="space-y-3">
              {pools.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between px-3 py-3 rounded-xl bg-[color:var(--dash-surface)] border border-[color:var(--dash-border)]"
                >
                  <div>
                    <p className="text-xs text-[color:var(--dash-muted)]">
                      {p.label}
                    </p>
                    <p className="text-sm font-semibold">{p.value}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      p.change.startsWith('-')
                        ? 'text-red-400'
                        : 'text-[var(--profit)]'
                    }`}
                  >
                    {p.change}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-semibold">Deposit</p>
              <Coins className="h-5 w-5 text-[var(--profit)]" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--dash-muted)]">
                  Available
                </span>
                <span className="font-semibold">$14,495.38</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--dash-muted)]">
                  Collateral
                </span>
                <span className="font-semibold">$6,981.22</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[color:var(--dash-muted)]">Locked</span>
                <span className="font-semibold">$2,330.18</span>
              </div>
              <button className="w-full py-3 rounded-xl bg-[var(--profit)] text-black font-semibold hover:opacity-90 transition">
                Please enter amounts
              </button>
            </div>
          </GlassCard>

          <GlassCard className=" min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-semibold">Market alerts</p>
              <span className="text-xs text-[color:var(--dash-muted)]">
                Live feed
              </span>
            </div>
            <div className="space-y-3 flex-1">
              {[
                {
                  title: 'Gold volatility',
                  body: 'XAUUSD 1H volatility +12% vs 7d avg',
                  tone: 'positive',
                },
                {
                  title: 'Dollar index',
                  body: 'DXY easing; metals bid intraday',
                  tone: 'neutral',
                },
                {
                  title: 'CPI print',
                  body: 'CPI tomorrow 8:30 ET — expect swings',
                  tone: 'warning',
                },
                {
                  title: 'CPI prediction',
                  body: 'CPI tomorrow 8:30 ET — expect swings',
                  tone: 'positive',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] px-3 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide ${
                        item.tone === 'positive'
                          ? 'bg-[var(--profit)]/15 text-[var(--profit)]'
                          : item.tone === 'warning'
                          ? 'bg-orange-500/15 text-orange-300'
                          : 'bg-[color:var(--dash-soft)] text-[color:var(--dash-muted)]'
                      }`}
                    >
                      {item.tone}
                    </span>
                  </div>
                  <p className="text-xs text-[color:var(--dash-muted)] mt-1">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="xl:col-span-9 space-y-6">
          <GlassCard>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-[color:var(--dash-muted)]">
                  Asset price
                </p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-semibold">
                    {formattedAssetPrice}
                  </p>
                  <span className={`${changeTone} text-sm font-semibold`}>
                    {formattedAssetChange || '-'}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--dash-muted)]">
                  Gold price data shown for the last month.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setRefreshToken((prev) => prev + 1)}
                  className="px-3 py-2 rounded-lg cursor-pointer text-xs border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] text-[color:var(--dash-strong)] inline-flex items-center gap-2 hover:bg-[color:var(--dash-soft)] transition"
                  aria-label="Refresh chart data"
                >
                  <RefreshCw className="h-4 w-4 text-profit" />
                  Refresh
                </button>
                <button className="px-3 py-2 rounded-lg text-xs border border-[color:var(--dash-border)] bg-[color:var(--dash-soft)] text-[color:var(--dash-strong)] inline-flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[var(--profit)]" />
                  Gold (XAU/USD)
                </button>
              </div>
            </div>
            <TradingViewChart
              className="rounded-xl overflow-hidden"
              symbol={selectedSymbol}
              range={selectedRange}
              refreshToken={refreshToken}
              onPriceUpdate={(price, changePct) => {
                setAssetPrice(price);
                setAssetChange(changePct ?? null);
              }}
            />
          </GlassCard>

          <div className="grid md:grid-cols-3 gap-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={stat.label} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[color:var(--dash-muted)]">
                        {stat.label}
                      </p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[color:var(--dash-soft)] border border-[color:var(--dash-border)] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[var(--profit)]" />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <GlassCard>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">My positions</p>
                  <span className="text-xs text-[color:var(--dash-muted)]">
                    Live tracking
                  </span>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-3">
                    <div>
                      <p className="text-sm text-[color:var(--dash-muted)]">
                        XAUUSD
                      </p>
                      <p className="text-lg font-semibold">$28,447.21</p>
                    </div>
                    <span className="text-[var(--profit)] text-xs font-semibold">
                      +3.12%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-3">
                    <div>
                      <p className="text-sm text-[color:var(--dash-muted)]">
                        Silver
                      </p>
                      <p className="text-lg font-semibold">$12,110.05</p>
                    </div>
                    <span className="text-red-400 text-xs font-semibold">
                      -0.42%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)] p-3">
                    <div>
                      <p className="text-sm text-[color:var(--dash-muted)]">
                        Platinum
                      </p>
                      <p className="text-lg font-semibold">$8,774.18</p>
                    </div>
                    <span className="text-[var(--profit)] text-xs font-semibold">
                      +1.08%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">My liquidity</p>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--dash-muted)]">
                    <ArrowUpRight className="h-4 w-4 text-[var(--profit)]" />
                    <span>Growth last 7d</span>
                  </div>
                </div>
                <div className="h-48 flex items-end gap-2 bg-[color:var(--dash-surface)] border border-[color:var(--dash-border)] rounded-xl p-3">
                  {bars.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-md bg-gradient-to-t from-[#0c1f1f] to-[var(--profit)]/80 relative"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[color:var(--dash-surface)] border border-[color:var(--dash-border)] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[color:var(--dash-muted)]">
                        Deposits
                      </p>
                      <p className="font-semibold">$68,025.10</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-[var(--profit)]" />
                  </div>
                  <div className="rounded-xl bg-[color:var(--dash-surface)] border border-[color:var(--dash-border)] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[color:var(--dash-muted)]">
                        Withdrawn
                      </p>
                      <p className="font-semibold">$12,110.00</p>
                    </div>
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
