import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const PAGE_VISITS_METRIC_KEY = "facebook:page_visits";
const FOLLOWERS_METRIC_KEY = "facebook:followers";
const META_SOURCE = "facebook_graph_api";
const FALLBACK_CACHE_TTL_SECONDS = 15 * 60;

type StoredMetric = {
  metric: string;
  count: number;
  updatedAt?: Date;
  createdAt?: Date;
  source?: string;
};

type GraphPageResponse = {
  fan_count?: number;
  followers_count?: number;
};

type InsightValue = { value?: number };
type InsightMetric = { name?: string; values?: InsightValue[] };
type GraphInsightsResponse = { data?: InsightMetric[] };

function parseMetricValue(metrics: InsightMetric[] | undefined, metricName: string): number {
  const metric = metrics?.find((item) => item.name === metricName);
  const rawValue = metric?.values?.[0]?.value;
  return Number.isFinite(rawValue) ? Number(rawValue) : 0;
}

async function fetchFacebookMetrics() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    throw new Error("Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN in environment variables");
  }

  const pageUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}`);
  pageUrl.searchParams.set("fields", "fan_count,followers_count");
  pageUrl.searchParams.set("access_token", accessToken);

  const insightsUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}/insights`);
  insightsUrl.searchParams.set("metric", "page_views_total");
  insightsUrl.searchParams.set("period", "day");
  insightsUrl.searchParams.set("access_token", accessToken);

  const [pageResponse, insightsResponse] = await Promise.all([
    fetch(pageUrl.toString(), { cache: "no-store" }),
    fetch(insightsUrl.toString(), { cache: "no-store" }),
  ]);

  if (!pageResponse.ok) {
    throw new Error(`Failed to fetch page fields from Graph API (${pageResponse.status})`);
  }

  if (!insightsResponse.ok) {
    throw new Error(`Failed to fetch page insights from Graph API (${insightsResponse.status})`);
  }

  const pageData = (await pageResponse.json()) as GraphPageResponse;
  const insightsData = (await insightsResponse.json()) as GraphInsightsResponse;

  const followers = Number(pageData.followers_count ?? pageData.fan_count ?? 0);
  const pageVisits = parseMetricValue(insightsData.data, "page_views_total");

  return {
    followers: Number.isFinite(followers) ? followers : 0,
    pageVisits,
  };
}

function getCacheTtlMs() {
  const ttlSeconds = Number(process.env.FACEBOOK_METRICS_CACHE_TTL_SECONDS ?? FALLBACK_CACHE_TTL_SECONDS);
  return (Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : FALLBACK_CACHE_TTL_SECONDS) * 1000;
}

function isFresh(updatedAt: Date | undefined, ttlMs: number) {
  if (!updatedAt) {
    return false;
  }

  return Date.now() - updatedAt.getTime() < ttlMs;
}

export async function GET() {
  const ttlMs = getCacheTtlMs();
  const now = new Date();

  try {
    const db = await getMongoDb();
    const metricsCollection = db.collection<StoredMetric>("site_metrics");

    const [storedVisits, storedFollowers] = await Promise.all([
      metricsCollection.findOne({ metric: PAGE_VISITS_METRIC_KEY }),
      metricsCollection.findOne({ metric: FOLLOWERS_METRIC_KEY }),
    ]);

    const hasFreshCache =
      isFresh(storedVisits?.updatedAt, ttlMs) && isFresh(storedFollowers?.updatedAt, ttlMs);

    if (hasFreshCache) {
      return NextResponse.json({
        pageVisits: storedVisits?.count ?? 0,
        followers: storedFollowers?.count ?? 0,
        source: "cache",
      });
    }

    const latest = await fetchFacebookMetrics();

    await Promise.all([
      metricsCollection.updateOne(
        { metric: PAGE_VISITS_METRIC_KEY },
        {
          $set: {
            metric: PAGE_VISITS_METRIC_KEY,
            count: latest.pageVisits,
            source: META_SOURCE,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      ),
      metricsCollection.updateOne(
        { metric: FOLLOWERS_METRIC_KEY },
        {
          $set: {
            metric: FOLLOWERS_METRIC_KEY,
            count: latest.followers,
            source: META_SOURCE,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      ),
    ]);

    return NextResponse.json({
      pageVisits: latest.pageVisits,
      followers: latest.followers,
      source: "facebook",
    });
  } catch (error) {
    console.error("Failed to fetch Facebook metrics", error);

    try {
      const db = await getMongoDb();
      const metricsCollection = db.collection<StoredMetric>("site_metrics");
      const [storedVisits, storedFollowers] = await Promise.all([
        metricsCollection.findOne({ metric: PAGE_VISITS_METRIC_KEY }),
        metricsCollection.findOne({ metric: FOLLOWERS_METRIC_KEY }),
      ]);

      return NextResponse.json(
        {
          pageVisits: storedVisits?.count ?? 0,
          followers: storedFollowers?.count ?? 0,
          source: "fallback_cache",
        },
        { status: 200 }
      );
    } catch (cacheError) {
      console.error("Failed to read fallback Facebook cache", cacheError);
      return NextResponse.json(
        {
          pageVisits: 0,
          followers: 0,
          source: "unavailable",
        },
        { status: 200 }
      );
    }
  }
}
