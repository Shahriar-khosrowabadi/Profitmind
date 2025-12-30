'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CrosshairMode,
  LineStyle,
  type Time,
  type ISeriesApi,
  type IChartApi,
  createChart,
} from 'lightweight-charts';

type Props = {
  className?: string;
  // Optional callback to surface latest price (and change %) to parent UI.
  onPriceUpdate?: (price: number, changePct?: number) => void;
  refreshToken?: number;
  // Controlled filters (optional).
  symbol?: AssetSymbol;
  range?: RangeOption;
  // When false, chart only loads after refreshToken changes.
  autoLoad?: boolean;
};

export type AssetSymbol = 'usd_xau';
export type RangeOption = 'day' | '1m' | '3m';

type PricePoint = { time: Time; value: number };

type PriceSeriesResponse = {
  symbol: AssetSymbol;
  range: RangeOption;
  latest: {
    price: number;
    change?: number;
    timestamp?: number;
    date?: string;
  };
  series: PricePoint[];
};

const TradingViewChart: React.FC<Props> = ({
  className = '',
  onPriceUpdate,
  refreshToken,
  symbol: controlledSymbol,
  range: controlledRange,
  autoLoad = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<AssetSymbol>(controlledSymbol ?? 'usd_xau');
  const [range, setRange] = useState<RangeOption>(controlledRange ?? '1m');
  const [seriesData, setSeriesData] = useState<PricePoint[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [trendTone, setTrendTone] = useState<'up' | 'down'>('up');
  const initialRefreshToken = useRef<number | undefined>(refreshToken);
  const chartId = useMemo(
    () => `lw-xauusd-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const resolveThemeColors = () => {
    if (typeof window === 'undefined') {
      return {
        text: 'rgba(255,255,255,0.7)',
        grid: 'rgba(255,255,255,0.08)',
        background: 'transparent',
      };
    }
    const styles = getComputedStyle(document.documentElement);
    const dashStrong = styles.getPropertyValue('--dash-strong').trim();
    const dashMuted = styles.getPropertyValue('--dash-muted').trim();
    const dashBorder = styles.getPropertyValue('--dash-border').trim();
    return {
      text: dashMuted || dashStrong || '#111827',
      grid: dashBorder || 'rgba(0,0,0,0.08)',
      background: 'transparent',
    };
  };

  const toUnixTime = useCallback((time: Time) => {
    if (typeof time === 'number') return time;
    if (typeof time === 'object' && time) {
      return Math.floor(
        Date.UTC(time.year, time.month - 1, time.day) / 1000
      );
    }
    return 0;
  }, []);

  const getTimeScaleOptions = useCallback((selected: RangeOption) => {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    });
    const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const tickMarkFormatter = (time: Time) => {
      const date = new Date(toUnixTime(time) * 1000);
      return selected === 'day'
        ? dateTimeFormatter.format(date)
        : dateFormatter.format(date);
    };
    if (selected === 'day') {
      return {
        rightOffset: 0,
        barSpacing: 8,
        secondsVisible: true,
        timeVisible: true,
        tickMarkFormatter,
      };
    }
    return {
      rightOffset: 0,
      barSpacing: selected === '1m' ? 6 : 4,
      secondsVisible: false,
      timeVisible: true,
      tickMarkFormatter,
    };
  }, [toUnixTime]);

  const getTimeFormatter = useCallback((selected: RangeOption) => {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: '2-digit',
    });
    const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return (time: Time) => {
      const date = new Date(toUnixTime(time) * 1000);
      return selected === 'day'
        ? dateTimeFormatter.format(date)
        : dateFormatter.format(date);
    };
  }, [toUnixTime]);

  // Keep internal state in sync with controlled props.
  useEffect(() => {
    if (controlledSymbol) {
      setSymbol(controlledSymbol);
    }
  }, [controlledSymbol]);

  useEffect(() => {
    if (controlledRange) {
      setRange(controlledRange);
    }
  }, [controlledRange]);

  const fetchSeries = useCallback(async () => {
    setIsFetching(true);
    try {
      const effectiveSymbol = controlledSymbol ?? symbol;
      const effectiveRange = controlledRange ?? range;
      const res = await fetch(
        `/api/market?symbol=${effectiveSymbol}&range=${effectiveRange}&ts=${Date.now()}`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        let serverMessage = '';
        try {
          const body = (await res.json()) as { error?: string };
          serverMessage = body?.error ? `: ${body.error}` : '';
        } catch {
          serverMessage = '';
        }
        throw new Error(`Data error ${res.status}${serverMessage}`);
      }

      const payload: PriceSeriesResponse = await res.json();
      const normalized = (payload.series ?? []).map((point) => ({
        time:
          (typeof point.time === 'number'
            ? point.time
            : toUnixTime(point.time)) as Time,
        value: point.value,
      }));
      const sorted = normalized.slice().sort((a, b) => {
        return toUnixTime(a.time) - toUnixTime(b.time);
      });
      if (!sorted.length) {
        throw new Error('No data returned for chart');
      }

      setSeriesData(sorted);

      const lastPoint = sorted[sorted.length - 1];
      const firstPoint = sorted[0];
      const prevPoint = sorted.length > 1 ? sorted[sorted.length - 2] : undefined;
      const changePct =
        firstPoint && firstPoint.value !== 0
          ? ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100
          : undefined;

      const latestDelta =
        prevPoint && prevPoint.value !== 0
          ? lastPoint.value - prevPoint.value
          : undefined;
      setTrendTone(latestDelta !== undefined && latestDelta < 0 ? 'down' : 'up');
      onPriceUpdate?.(lastPoint.value, changePct ?? payload.latest.change);
      setError(null);
      setIsReady(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load price');
    } finally {
      setIsFetching(false);
    }
  }, [controlledRange, controlledSymbol, onPriceUpdate, range, symbol]);

  useEffect(() => {
    if (!autoLoad) return;
    fetchSeries();
  }, [fetchSeries]);

  useEffect(() => {
    if (refreshToken === undefined) return;
    if (!autoLoad && refreshToken === initialRefreshToken.current) return;
    fetchSeries();
  }, [fetchSeries, refreshToken]);

  useEffect(() => {
    if (!containerRef.current) return;

    const theme = resolveThemeColors();
    const initialRange = controlledRange ?? range;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: 'solid', color: theme.background },
        textColor: theme.text,
      },
      grid: {
        vertLines: { color: theme.grid },
        horzLines: { color: theme.grid },
      },
      timeScale: getTimeScaleOptions(initialRange),
      crosshair: { mode: CrosshairMode.Normal },
      localization: { locale: 'en-US', timeFormatter: getTimeFormatter(initialRange) },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    const { clientWidth, clientHeight } = containerRef.current;
    chart.applyOptions({ width: clientWidth, height: clientHeight });
    chartRef.current = chart;

    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(52, 211, 153, 0.25)',
      bottomColor: 'rgba(52, 211, 153, 0.05)',
      lineColor: 'rgba(52, 211, 153, 1)',
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: 'rgba(52, 211, 153, 1)',
      priceLineStyle: LineStyle.Solid,
      lastValueVisible: true,
      title: 'Gold (XAU/USD)',
    });
    seriesRef.current = areaSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        chart.applyOptions({ width: clientWidth, height: clientHeight });
      }
    });
    resizeObserver.observe(containerRef.current);

    const mutationObserver = new MutationObserver(() => {
      const updated = resolveThemeColors();
      chart.applyOptions({
        layout: {
          background: { type: 'solid', color: updated.background },
          textColor: updated.text,
        },
        grid: {
          vertLines: { color: updated.grid },
          horzLines: { color: updated.grid },
        },
      });
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartId, getTimeScaleOptions, getTimeFormatter, range, controlledRange]);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !seriesData.length) return;
    seriesRef.current.setData(seriesData);
    chartRef.current.timeScale().fitContent();
  }, [seriesData]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const isDown = trendTone === 'down';
    const line = isDown ? 'rgba(248, 113, 113, 1)' : 'rgba(52, 211, 153, 1)';
    const top = isDown ? 'rgba(248, 113, 113, 0.25)' : 'rgba(52, 211, 153, 0.25)';
    const bottom = isDown ? 'rgba(248, 113, 113, 0.05)' : 'rgba(52, 211, 153, 0.05)';
    seriesRef.current.applyOptions({
      lineColor: line,
      topColor: top,
      bottomColor: bottom,
      priceLineColor: line,
    });
  }, [trendTone]);

  useEffect(() => {
    if (!chartRef.current) return;
    const selected = controlledRange ?? range;
    chartRef.current.timeScale().applyOptions(getTimeScaleOptions(selected));
    chartRef.current.applyOptions({
      localization: { locale: 'en-US', timeFormatter: getTimeFormatter(selected) },
    });
  }, [controlledRange, getTimeScaleOptions, getTimeFormatter, range]);

  return (
    <div className={`relative w-full h-[420px] rounded-xl overflow-hidden ${className}`}>
      {!autoLoad && !isFetching && !seriesData.length && !error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-10">
          <div className="rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-panel)]/80 px-4 py-3 text-center">
            <p className="text-xs text-[color:var(--dash-muted)]">
              Chart data is paused to avoid API limits.
            </p>
            <p className="text-xs text-[color:var(--dash-strong)] mt-1">
              Click the Refresh button to load data.
            </p>
          </div>
        </div>
      ) : null}
      {(isFetching || (autoLoad && !isReady)) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-10">
          <div className="h-10 w-10 border-4 border-white/20 border-t-[var(--profit)] rounded-full animate-spin" />
          <p className="text-xs text-white/60 mt-3">
            {isFetching ? 'Refreshing data...' : 'Loading live chart...'}
          </p>
        </div>
      )}
      {error ? (
        <div className="absolute top-3 right-3 z-20 rounded-md bg-red-500/10 border border-red-500/40 px-3 py-1 text-xs text-red-200">
          {error}
        </div>
      ) : null}
      <div ref={containerRef} id={chartId} className="w-full h-full" />
    </div>
  );
};

export default TradingViewChart;

