import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const METRIC_KEY = "website_visits";

function normalizePathname(rawUrl: string | null) {
  if (!rawUrl) {
    return "/";
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.pathname || "/";
  } catch {
    if (rawUrl.startsWith("/")) {
      return rawUrl;
    }

    return `/${rawUrl}`;
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const pathname = rawUrl ? normalizePathname(rawUrl) : null;

  try {
    const db = await getMongoDb();
    const metricsCollection = db.collection<{ metric: string; count: number }>("site_metrics");

    const [total, perPage] = await Promise.all([
      metricsCollection.findOne({ metric: METRIC_KEY }),
      pathname ? metricsCollection.findOne({ metric: `page:${pathname}` }) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      status: "success",
      totalViews: total?.count ?? 0,
      ...(pathname
        ? {
            pathname,
            pageViews: perPage?.count ?? 0,
          }
        : {}),
    });
  } catch (error) {
    console.error("Failed to fetch view stats", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch view stats",
      },
      { status: 500 }
    );
  }
}
