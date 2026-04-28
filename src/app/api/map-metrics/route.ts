import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const SOURCE_KEYS = ["facebook", "instagram", "tiktok", "whatsapp", "zalo"] as const;
const COUNTRY_COLORS = ["#1e40af", "#f59e0b", "#dc2626", "#16a34a", "#7c3aed", "#ea580c", "#db2777"];

type MetricDoc = {
  metric: string;
  count?: number;
  pathname?: string;
  country?: string;
  city?: string;
  district?: string;
};

function normalizeMetricKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

function normalizeLocationText(value?: string | null) {
  if (!value) return null;

  let normalized = value.trim().replace(/\+/g, " ");
  if (!normalized) return null;

  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // keep original value when malformed
  }

  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
}

function getCountryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export async function GET() {
  try {
    const db = await getMongoDb();
    const metricsCollection = db.collection<MetricDoc>("site_metrics");

    const [
      websiteVisitsDoc,
      sourceDocs,
      countryDocs,
      cityDocs,
      districtDocs,
      pageDocs,
      facebookVisitsDoc,
      facebookFollowersDoc,
    ] =
      await Promise.all([
        metricsCollection.findOne({ metric: "website_visits" }),
        metricsCollection
          .find({ metric: { $in: SOURCE_KEYS.map((source) => `source:${source}`) } })
          .toArray(),
        metricsCollection.find({ metric: /^country:/ }).toArray(),
        metricsCollection.find({ metric: /^city:/ }).toArray(),
        metricsCollection.find({ metric: /^district:/ }).toArray(),
        metricsCollection.find({ metric: /^page:/ }).toArray(),
        metricsCollection.findOne({ metric: "facebook:page_visits" }),
        metricsCollection.findOne({ metric: "facebook:followers" }),
      ]);

    const sourceVisits = Object.fromEntries(SOURCE_KEYS.map((source) => [source, 0])) as Record<
      (typeof SOURCE_KEYS)[number],
      number
    >;
    sourceDocs.forEach((doc) => {
      const source = doc.metric.replace("source:", "") as (typeof SOURCE_KEYS)[number];
      sourceVisits[source] = doc.count ?? 0;
    });

    const countries = countryDocs
      .map((doc) => {
        const code = doc.metric.replace("country:", "");
        return {
          code,
          name: getCountryName(code),
          visits: doc.count ?? 0,
        };
      })
      .filter((country) => /^[A-Z]{2}$/.test(country.code) && country.visits > 0)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 7)
      .map((country, index) => ({
        ...country,
        color: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
      }));

    const topPages = pageDocs
      .map((doc) => ({
        pathname: doc.pathname || doc.metric.replace("page:", ""),
        visits: doc.count ?? 0,
      }))
      .filter((page) => page.visits > 0)
      .sort((a, b) => b.visits - a.visits);

    const cityBuckets = new Map<
      string,
      { name: string; country: string; visits: number }
    >();

    cityDocs.forEach((doc) => {
      const visits = doc.count ?? 0;
      if (visits <= 0) return;

      const cityName =
        normalizeLocationText(doc.city || doc.metric.split(":").pop()) ||
        "Unknown";
      const countryCode = normalizeLocationText(doc.country)?.toUpperCase() || "??";
      const cityKey = `${countryCode}:${normalizeMetricKey(cityName)}`;
      const current = cityBuckets.get(cityKey);

      if (current) {
        current.visits += visits;
        return;
      }

      cityBuckets.set(cityKey, {
        name: cityName,
        country: countryCode,
        visits,
      });
    });

    const topCities = Array.from(cityBuckets.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    const districtBuckets = new Map<
      string,
      { name: string; city: string; country: string; visits: number }
    >();

    districtDocs.forEach((doc) => {
      const visits = doc.count ?? 0;
      if (visits <= 0) return;

      const districtName =
        normalizeLocationText(doc.district || doc.metric.split(":").pop()) ||
        "Unknown";
      const cityName = normalizeLocationText(doc.city) || "Unknown";
      const countryCode = normalizeLocationText(doc.country)?.toUpperCase() || "??";
      const districtKey = `${countryCode}:${normalizeMetricKey(cityName)}:${normalizeMetricKey(
        districtName
      )}`;
      const current = districtBuckets.get(districtKey);

      if (current) {
        current.visits += visits;
        return;
      }

      districtBuckets.set(districtKey, {
        name: districtName,
        city: cityName,
        country: countryCode,
        visits,
      });
    });

    const topDistricts = Array.from(districtBuckets.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    const facebookVisitors = (facebookVisitsDoc?.count ?? 0) + (facebookFollowersDoc?.count ?? 0);

    return NextResponse.json({
      websiteVisits: websiteVisitsDoc?.count ?? 0,
      facebookVisitors,
      sourceVisits,
      countries,
      countryCount: countryDocs.length,
      cityCount: cityBuckets.size,
      districtCount: districtBuckets.size,
      topCities,
      topDistricts,
      uniquePages: pageDocs.length,
      topPages,
    });
  } catch (error) {
    console.error("Failed to fetch map metrics", error);
    return NextResponse.json(
      {
        websiteVisits: 0,
        facebookVisitors: 0,
        sourceVisits: Object.fromEntries(SOURCE_KEYS.map((source) => [source, 0])),
        countries: [],
        countryCount: 0,
        cityCount: 0,
        districtCount: 0,
        topCities: [],
        topDistricts: [],
        uniquePages: 0,
        topPages: [],
      },
      { status: 200 }
    );
  }
}
