"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type ReverseGeoResponse = {
  countryCode?: string;
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  localityInfo?: {
    administrative?: Array<{
      name?: string;
      adminLevel?: number;
      description?: string;
    }>;
  };
};

type GeoPayload = {
  country?: string;
  city?: string;
  district?: string;
};

const GEO_MODE_KEY = "adnz:geo:mode";
const GEO_CACHE_KEY = "adnz:geo:payload";

function pickDistrict(data: ReverseGeoResponse) {
  const admin = data.localityInfo?.administrative ?? [];
  const districtCandidate = admin.find((item) => {
    const label = `${item.name ?? ""} ${item.description ?? ""}`.toLowerCase();
    return (
      label.includes("district") ||
      label.includes("quan") ||
      label.includes("huyen") ||
      (typeof item.adminLevel === "number" && item.adminLevel >= 6)
    );
  });

  return (
    districtCandidate?.name ||
    data.locality ||
    data.principalSubdivision ||
    undefined
  );
}

async function reverseGeocode(latitude: number, longitude: number): Promise<GeoPayload | null> {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "en");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return null;

  const data = (await response.json()) as ReverseGeoResponse;

  return {
    country: data.countryCode || undefined,
    city: data.city || data.locality || undefined,
    district: pickDistrict(data),
  };
}

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 4500,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

async function getGeoPayloadForTracking() {
  try {
    const mode = window.sessionStorage.getItem(GEO_MODE_KEY);
    const cached = window.sessionStorage.getItem(GEO_CACHE_KEY);

    if (mode === "gps" && cached) {
      return JSON.parse(cached) as GeoPayload;
    }

    if (mode === "ip_only") {
      return undefined;
    }

    const position = await getCurrentPosition();
    const payload = await reverseGeocode(
      position.coords.latitude,
      position.coords.longitude
    );

    if (!payload) {
      window.sessionStorage.setItem(GEO_MODE_KEY, "ip_only");
      return undefined;
    }

    window.sessionStorage.setItem(GEO_MODE_KEY, "gps");
    window.sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    window.sessionStorage.setItem(GEO_MODE_KEY, "ip_only");
    return undefined;
  }
}

export function WebsiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const rawSource = params.get("utm_source")?.trim().toLowerCase() ?? "";
    const normalizedSource =
      rawSource === "fb"
        ? "facebook"
        : rawSource === "ig"
          ? "instagram"
          : rawSource === "tt"
            ? "tiktok"
            : rawSource;
    const sourceKey = `adnz:source:${normalizedSource || "direct"}`;
    const pathStorageKey = `adnz:tracked:${pathname}`;
    const isNewSourceSession =
      Boolean(normalizedSource) &&
      !window.sessionStorage.getItem(sourceKey);

    if (window.sessionStorage.getItem(pathStorageKey)) {
      return;
    }

    window.sessionStorage.setItem(pathStorageKey, "1");

    if (isNewSourceSession) {
      window.sessionStorage.setItem(sourceKey, "1");
    }

    void (async () => {
      const geoPayload = await getGeoPayloadForTracking();

      await fetch("/api/site-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathname,
          source: normalizedSource || undefined,
          isNewSourceSession,
          geo: geoPayload,
        }),
        keepalive: true,
      }).catch(() => {
        window.sessionStorage.removeItem(pathStorageKey);

        if (isNewSourceSession) {
          window.sessionStorage.removeItem(sourceKey);
        }
      });
    })();
  }, [pathname]);

  return null;
}
