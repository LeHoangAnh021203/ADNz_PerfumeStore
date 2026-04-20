import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const METRIC_KEY = "website_visits";
const TRACKED_SOURCES = ["facebook", "instagram", "tiktok", "whatsapp", "zalo"];

type GeoPayload = {
  country?: string;
  city?: string;
  district?: string;
};

function normalizeText(value?: string) {
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

function normalizeCountryCode(value?: string) {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized) || normalized === "XX" || normalized === "T1") {
    return null;
  }
  return normalized;
}

function extractGeo(request: Request, payload?: GeoPayload) {
  const countryCode = normalizeCountryCode(
    payload?.country ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code") ||
      ""
  );

  const city = normalizeText(
    payload?.city ||
      request.headers.get("x-vercel-ip-city") ||
      request.headers.get("x-city-name") ||
      ""
  );

  const district = normalizeText(
    payload?.district ||
      request.headers.get("x-vercel-ip-country-region") ||
      request.headers.get("x-district-name") ||
      ""
  );

  return { countryCode, city, district };
}

function normalizeSource(source?: string) {
  if (!source) {
    return null;
  }

  const normalized = source.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === "ig") {
    return "instagram";
  }

  if (normalized === "fb") {
    return "facebook";
  }

  if (normalized === "tt") {
    return "tiktok";
  }

  return TRACKED_SOURCES.includes(normalized) ? normalized : null;
}

export async function GET() {
  try {
    const db = await getMongoDb();
    const metricsCollection = db.collection<{ metric: string; count: number }>("site_metrics");
    const metrics = await metricsCollection.findOne({ metric: METRIC_KEY });
    const sourceMetrics = await metricsCollection
      .find({
        metric: {
          $in: TRACKED_SOURCES.map((source) => `source:${source}`),
        },
      })
      .toArray();

    const sourceVisits = Object.fromEntries(
      TRACKED_SOURCES.map((source) => [source, 0])
    ) as Record<string, number>;

    sourceMetrics.forEach((metric) => {
      const source = metric.metric.replace("source:", "");
      sourceVisits[source] = metric.count ?? 0;
    });

    return NextResponse.json({
      websiteVisits: metrics?.count ?? 0,
      sourceVisits,
    });
  } catch (error) {
    console.error("Failed to fetch site metrics", error);
    return NextResponse.json(
      {
        websiteVisits: 0,
        sourceVisits: Object.fromEntries(
          TRACKED_SOURCES.map((source) => [source, 0])
        ),
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      pathname?: string;
      source?: string;
      isNewSourceSession?: boolean;
      geo?: GeoPayload;
    };
    const pathname = body.pathname || "/";
    const source = normalizeSource(body.source);
    const isNewSourceSession = Boolean(body.isNewSourceSession);
    const geo = extractGeo(request, body.geo);
    const db = await getMongoDb();
    const now = new Date();

    const updates: Promise<unknown>[] = [];

    updates.push(db.collection("site_metrics").updateOne(
      { metric: METRIC_KEY },
      {
        $inc: { count: 1 },
        $set: { updatedAt: now },
        $setOnInsert: { metric: METRIC_KEY, createdAt: now },
      },
      { upsert: true }
    ));

    if (source && isNewSourceSession) {
      updates.push(db.collection("site_metrics").updateOne(
        { metric: `source:${source}` },
        {
          $inc: { count: 1 },
          $set: { updatedAt: now, source },
          $setOnInsert: {
            metric: `source:${source}`,
            createdAt: now,
          },
        },
        { upsert: true }
      ));
    }

    updates.push(db.collection("site_metrics").updateOne(
      { metric: `page:${pathname}` },
      {
        $inc: { count: 1 },
        $set: { updatedAt: now, pathname },
        $setOnInsert: {
          metric: `page:${pathname}`,
          createdAt: now,
        },
      },
      { upsert: true }
    ));

    if (geo.countryCode) {
      updates.push(db.collection("site_metrics").updateOne(
        { metric: `country:${geo.countryCode}` },
        {
          $inc: { count: 1 },
          $set: { updatedAt: now, country: geo.countryCode },
          $setOnInsert: {
            metric: `country:${geo.countryCode}`,
            createdAt: now,
          },
        },
        { upsert: true }
      ));

      if (geo.city) {
        const cityKey = normalizeMetricKey(geo.city);
        updates.push(db.collection("site_metrics").updateOne(
          { metric: `city:${geo.countryCode}:${cityKey}` },
          {
            $inc: { count: 1 },
            $set: { updatedAt: now, country: geo.countryCode, city: geo.city },
            $setOnInsert: {
              metric: `city:${geo.countryCode}:${cityKey}`,
              createdAt: now,
            },
          },
          { upsert: true }
        ));

        if (geo.district) {
          const districtKey = normalizeMetricKey(geo.district);
          updates.push(db.collection("site_metrics").updateOne(
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
          ));
        }
      }
    }

    await Promise.all(updates);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to track site metrics", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
