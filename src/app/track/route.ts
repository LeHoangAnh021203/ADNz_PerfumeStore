import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const METRIC_KEY = "website_visits";

function normalizeText(value?: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeMetricKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

function normalizeCountryCode(value?: string | null) {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === "XX" || normalized === "T1") {
    return null;
  }
  return normalized;
}

function extractGeo(request: NextRequest) {
  const countryCode = normalizeCountryCode(
    request.nextUrl.searchParams.get("country") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code")
  );

  const city = normalizeText(
    request.nextUrl.searchParams.get("city") ||
      request.headers.get("x-vercel-ip-city") ||
      request.headers.get("x-city-name")
  );

  const district = normalizeText(
    request.nextUrl.searchParams.get("district") ||
      request.headers.get("x-vercel-ip-country-region") ||
      request.headers.get("x-district-name")
  );

  return { countryCode, city, district };
}

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
  const pathname = normalizePathname(rawUrl);
  const geo = extractGeo(request);
  const now = new Date();

  try {
    const db = await getMongoDb();
    const metricsCollection = db.collection<{ metric: string; count: number }>("site_metrics");

    const updates = [
      metricsCollection.updateOne(
        { metric: METRIC_KEY },
        {
          $inc: { count: 1 },
          $set: { updatedAt: now },
          $setOnInsert: { metric: METRIC_KEY, createdAt: now },
        },
        { upsert: true }
      ),
      metricsCollection.updateOne(
        { metric: `page:${pathname}` },
        {
          $inc: { count: 1 },
          $set: { updatedAt: now, pathname },
          $setOnInsert: { metric: `page:${pathname}`, createdAt: now },
        },
        { upsert: true }
      ),
    ];

    if (geo.countryCode) {
      updates.push(
        metricsCollection.updateOne(
          { metric: `country:${geo.countryCode}` },
          {
            $inc: { count: 1 },
            $set: { updatedAt: now, country: geo.countryCode },
            $setOnInsert: { metric: `country:${geo.countryCode}`, createdAt: now },
          },
          { upsert: true }
        )
      );

      if (geo.city) {
        const cityKey = normalizeMetricKey(geo.city);
        updates.push(
          metricsCollection.updateOne(
            { metric: `city:${geo.countryCode}:${cityKey}` },
            {
              $inc: { count: 1 },
              $set: { updatedAt: now, country: geo.countryCode, city: geo.city },
              $setOnInsert: { metric: `city:${geo.countryCode}:${cityKey}`, createdAt: now },
            },
            { upsert: true }
          )
        );

        if (geo.district) {
          const districtKey = normalizeMetricKey(geo.district);
          updates.push(
            metricsCollection.updateOne(
              { metric: `district:${geo.countryCode}:${cityKey}:${districtKey}` },
              {
                $inc: { count: 1 },
                $set: {
                  updatedAt: now,
                  country: geo.countryCode,
                  city: geo.city,
                  district: geo.district,
                },
                $setOnInsert: {
                  metric: `district:${geo.countryCode}:${cityKey}:${districtKey}`,
                  createdAt: now,
                },
              },
              { upsert: true }
            )
          );
        }
      }
    }

    await Promise.all(updates);

    const totals = await metricsCollection.findOne({ metric: METRIC_KEY });

    return NextResponse.json({
      status: "success",
      pathname,
      totalViews: totals?.count ?? 0,
    });
  } catch (error) {
    console.error("Failed to track page view", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to track page view",
      },
      { status: 500 }
    );
  }
}
