import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const PAGE_VISITS_METRIC_KEY = "facebook:page_visits";
const FOLLOWERS_METRIC_KEY = "facebook:followers";
const META_SOURCE = "facebook_graph_api";

type GraphPageResponse = {
  id?: string;
  name?: string;
  fan_count?: number;
  followers_count?: number;
  error?: { message?: string };
};

type InsightValue = { value?: number };
type InsightMetric = { name?: string; values?: InsightValue[] };
type GraphInsightsResponse = {
  data?: InsightMetric[];
  error?: { message?: string };
};

function parseMetricValue(metrics: InsightMetric[] | undefined, metricName: string): number {
  const metric = metrics?.find((item) => item.name === metricName);
  const rawValue = metric?.values?.[0]?.value;
  return Number.isFinite(rawValue) ? Number(rawValue) : 0;
}

export async function GET(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get("page_id") ?? process.env.FACEBOOK_PAGE_ID;
  const accessToken =
    request.nextUrl.searchParams.get("access_token") ?? process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing page_id/access_token (query) or FACEBOOK_PAGE_ID/FACEBOOK_PAGE_ACCESS_TOKEN (.env.local)",
      },
      { status: 400 }
    );
  }

  try {
    const pageUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}`);
    pageUrl.searchParams.set("fields", "id,name,fan_count,followers_count");
    pageUrl.searchParams.set("access_token", accessToken);

    const insightsUrl = new URL(`https://graph.facebook.com/v23.0/${pageId}/insights`);
    insightsUrl.searchParams.set("metric", "page_views_total");
    insightsUrl.searchParams.set("period", "day");
    insightsUrl.searchParams.set("access_token", accessToken);

    const [pageResponse, insightsResponse] = await Promise.all([
      fetch(pageUrl.toString(), { cache: "no-store" }),
      fetch(insightsUrl.toString(), { cache: "no-store" }),
    ]);

    if (!pageResponse.ok || !insightsResponse.ok) {
      const [pageError, insightsError] = await Promise.all([
        pageResponse.json().catch(() => ({})),
        insightsResponse.json().catch(() => ({})),
      ]);

      return NextResponse.json(
        {
          status: "error",
          message: "Failed to fetch Facebook metrics",
          details: {
            page: pageError,
            insights: insightsError,
          },
        },
        { status: 400 }
      );
    }

    const [pageData, insightsData] = (await Promise.all([
      pageResponse.json(),
      insightsResponse.json(),
    ])) as [GraphPageResponse, GraphInsightsResponse];

    const likes = Number(pageData.fan_count ?? 0);
    const followers = Number(pageData.followers_count ?? pageData.fan_count ?? 0);
    const views = parseMetricValue(insightsData.data, "page_views_total");
    const now = new Date();

    const db = await getMongoDb();
    const metricsCollection = db.collection("site_metrics");

    await Promise.all([
      metricsCollection.updateOne(
        { metric: PAGE_VISITS_METRIC_KEY },
        {
          $set: {
            metric: PAGE_VISITS_METRIC_KEY,
            count: Number.isFinite(views) ? views : 0,
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
            count: Number.isFinite(followers) ? followers : 0,
            source: META_SOURCE,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      ),
    ]);

    return NextResponse.json({
      status: "success",
      pageId: pageData.id ?? pageId,
      pageName: pageData.name ?? null,
      likes: Number.isFinite(likes) ? likes : 0,
      followers: Number.isFinite(followers) ? followers : 0,
      views: Number.isFinite(views) ? views : 0,
      visitors: (Number.isFinite(followers) ? followers : 0) + (Number.isFinite(views) ? views : 0),
      source: "facebook_graph_api",
    });
  } catch (error) {
    console.error("Failed to fetch Facebook stats", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error while fetching Facebook stats",
      },
      { status: 500 }
    );
  }
}
