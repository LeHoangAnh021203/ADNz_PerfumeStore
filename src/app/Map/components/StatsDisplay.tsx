"use client";

import { useEffect, useMemo, useState } from "react";
import { createContext, useContext } from "react";

type CountryMetric = {
  code: string;
  name: string;
  visits: number;
  color: string;
};

type SourceVisits = {
  facebook: number;
  instagram: number;
  tiktok: number;
  whatsapp: number;
  zalo: number;
};

type TopPage = {
  pathname: string;
  visits: number;
};

type MapMetrics = {
  websiteVisits: number;
  facebookVisitors: number;
  sourceVisits: SourceVisits;
  countries: CountryMetric[];
  countryCount: number;
  cityCount: number;
  districtCount: number;
  topCities: Array<{ name: string; country: string; visits: number }>;
  topDistricts: Array<{ name: string; city: string; country: string; visits: number }>;
  uniquePages: number;
  topPages: TopPage[];
};

const EMPTY_METRICS: MapMetrics = {
  websiteVisits: 0,
  facebookVisitors: 0,
  sourceVisits: {
    facebook: 0,
    instagram: 0,
    tiktok: 0,
    whatsapp: 0,
    zalo: 0,
  },
  countries: [],
  countryCount: 0,
  cityCount: 0,
  districtCount: 0,
  topCities: [],
  topDistricts: [],
  uniquePages: 0,
  topPages: [],
};

const WEBSITE_PAGES = [
  { pathname: "/", label: "Trang chủ" },
  { pathname: "/about-us", label: "Giới thiệu" },
  { pathname: "/pre-order", label: "Đăng ký CTV/Sỉ" },
  { pathname: "/ListProduct", label: "Danh sách sản phẩm" },
  { pathname: "/Map", label: "Bản đồ khách truy cập" },
  { pathname: "/chat", label: "Chat tư vấn" },
];

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function useMapMetrics() {
  const [metrics, setMetrics] = useState<MapMetrics>(EMPTY_METRICS);
  const [ratePerSecond, setRatePerSecond] = useState(0);

  useEffect(() => {
    let ignore = false;
    let prevValue = 0;
    let prevAt: number | null = null;

    async function refresh() {
      try {
        const response = await fetch("/api/map-metrics", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as MapMetrics;
        const now = Date.now();

        if (!ignore) {
          setMetrics(data);

          if (prevAt !== null) {
            const elapsedSeconds = (now - prevAt) / 1000;
            if (elapsedSeconds > 0) {
              const delta = Math.max(0, data.websiteVisits - prevValue);
              setRatePerSecond(Math.floor(delta / elapsedSeconds));
            }
          }

          prevValue = data.websiteVisits;
          prevAt = now;
        }
      } catch {
        if (!ignore) {
          setRatePerSecond(0);
        }
      }
    }

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, 60_000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return { metrics, ratePerSecond };
}

const MapMetricsContext = createContext<{ metrics: MapMetrics; ratePerSecond: number } | null>(null);

export function MapMetricsProvider({ children }: { children: React.ReactNode }) {
  const state = useMapMetrics();
  const value = useMemo(() => state, [state.metrics, state.ratePerSecond]);
  return <MapMetricsContext.Provider value={value}>{children}</MapMetricsContext.Provider>;
}

function useSharedMapMetrics() {
  const context = useContext(MapMetricsContext);
  if (!context) {
    throw new Error("MapMetricsProvider is required");
  }
  return context;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/55 p-4 md:p-6 w-full min-h-[120px] border border-zinc-800/80">
      <h2 className="my-0 mb-4 font-mono font-medium text-sm tracking-tight uppercase text-zinc-200">{title}</h2>
      {children}
    </div>
  );
}

export function TotalRequests() {
  const { metrics, ratePerSecond } = useSharedMapMetrics();

  return (
    <div className="space-y-2">
      <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-zinc-300">Total visitors</h2>
      <div className="text-4xl md:text-5xl tracking-normal font-mono tabular-nums">
        {formatNumber(metrics.websiteVisits)}
      </div>
      <div className="text-sm text-zinc-400 font-mono tabular-nums">{formatNumber(ratePerSecond)}/s</div>
    </div>
  );
}

export function TopCountries() {
  const { metrics } = useSharedMapMetrics();

  return (
    <div className="space-y-2">
      <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-zinc-300">Top countries by visitors</h2>
      {metrics.countries.length === 0 ? (
        <p className="text-zinc-400 text-sm">No country data yet (will appear after deployed traffic).</p>
      ) : (
        <ul className="list-none pl-0 space-y-1">
          {metrics.countries.map((country) => (
            <li key={country.code} className="flex items-center w-full md:w-fit justify-between md:justify-start">
              <span aria-hidden="true" className="inline-block translate-y-[-2px] translate-x-[2px]">
                <span style={{ color: country.color }}>■</span>
              </span>
              <div className="text-left">
                <h3 className="inline-block my-0 font-medium text-[16px]" style={{ color: country.color }}>
                  &nbsp;{country.code}
                </h3>
              </div>
              <div className="w-[16ch] text-right">
                <span className="inline-flex tabular-nums">{formatNumber(country.visits)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RegionCount() {
  const { metrics } = useSharedMapMetrics();

  return (
    <div className="flex items-center w-full md:w-fit justify-between md:justify-start mt-2">
      <span aria-hidden="true" className="inline-block translate-y-[-2px] translate-x-[2px]">
        <span className="text-[10px]">▲</span>
      </span>
      <div className="text-left">
        <span className="inline-block my-0 font-medium text-[16px]">&nbsp;{metrics.countryCount}</span>
        <span className="font-medium text-[16px] text-zinc-300 tracking-tight">&nbsp;Countries tracked</span>
      </div>
    </div>
  );
}

export function StatsGrid() {
  const { metrics } = useSharedMapMetrics();
  const visitsByPath = useMemo(
    () => new Map(metrics.topPages.map((page) => [page.pathname, page.visits])),
    [metrics.topPages]
  );
  const knownPageRows = WEBSITE_PAGES.map((page) => ({
    ...page,
    visits: visitsByPath.get(page.pathname) ?? 0,
  }));
  const unknownTrackedRows = metrics.topPages
    .filter((page) => !WEBSITE_PAGES.some((known) => known.pathname === page.pathname))
    .map((page) => ({
      pathname: page.pathname,
      label: page.pathname,
      visits: page.visits,
    }));
  const allPageRows = [...knownPageRows, ...unknownTrackedRows];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
      <Card title="Countries tracked">
        <p className="text-4xl md:text-5xl font-mono tabular-nums text-zinc-100 m-0">{formatNumber(metrics.countryCount)}</p>
        <p className="text-sm text-zinc-400 mt-2 mb-0">
          {metrics.countries.length > 0
            ? `Top: ${metrics.countries
                .slice(0, 3)
                .map((country) => country.code)
                .join(", ")}`
            : "No country data yet"}
        </p>
      </Card>

      <Card title="Cities tracked">
        <p className="text-4xl md:text-5xl font-mono tabular-nums text-zinc-100 m-0">{formatNumber(metrics.cityCount)}</p>
        {metrics.topCities.length > 0 ? (
          <ul className="list-none pl-0 mt-2 mb-0 space-y-1">
            {metrics.topCities.slice(0, 3).map((city) => (
              <li key={`${city.country}-${city.name}`} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-zinc-300 truncate">
                  {city.name}, {city.country}
                </span>
                <span className="text-zinc-100 tabular-nums">{formatNumber(city.visits)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400 mt-2 mb-0">No city data yet</p>
        )}
      </Card>

      <Card title="Districts tracked">
        <p className="text-4xl md:text-5xl font-mono tabular-nums text-zinc-100 m-0">{formatNumber(metrics.districtCount)}</p>
        {metrics.topDistricts.length > 0 ? (
          <ul className="list-none pl-0 mt-2 mb-0 space-y-1">
            {metrics.topDistricts.slice(0, 3).map((district) => (
              <li
                key={`${district.country}-${district.city}-${district.name}`}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-zinc-300 truncate">
                  {district.name}, {district.city}
                </span>
                <span className="text-zinc-100 tabular-nums">{formatNumber(district.visits)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400 mt-2 mb-0">No district data yet</p>
        )}
      </Card>

      <div className="md:col-span-2 lg:col-span-3">
        <Card title="Lượt xem theo từng trang">
          {allPageRows.length === 0 ? (
            <p className="text-zinc-400 text-sm m-0">Chưa có dữ liệu lượt xem theo trang.</p>
          ) : (
            <ul className="list-none pl-0 m-0 space-y-2">
              {allPageRows.map((page) => (
                <li key={page.pathname} className="flex items-center justify-between gap-3">
                  <p className="text-zinc-100 truncate m-0">{page.label}</p>
                  <span className="text-zinc-100 tabular-nums">{formatNumber(page.visits)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

    </div>
  );
}
