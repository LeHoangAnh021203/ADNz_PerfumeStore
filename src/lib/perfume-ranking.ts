import type { Perfume } from "@/types/perfume";

export const FRAGRANTICA_TOP_SLUGS = [
  "afnan-supremacy-collectors-edition",
  "amouage-guidance",
  "chanel-bleu-de-chanel-eau-de-parfum",
  "creed-absolu-aventus",
  "dior-dior-homme-intense",
  "dior-hypnotic-poison",
  "ex-nihilo-blue-talisman",
  "giorgio-armani-armani-code-parfum",
  "giorgio-armani-stronger-with-you-intensely",
  "guerlain-shalimar",
  "hermes-h24-herbes-vives",
  "tom-ford-tobacco-vanille",
  "yves-saint-laurent-black-opium-eau-de-parfum",
  "yves-saint-laurent-libre-intense",
  "yves-saint-laurent-libre-le-parfum",
  "yves-saint-laurent-myslf-le-parfum",
];

// Brand logo URLs for the "Top Brands" section.
// You can freely replace each value by:
// - local image path in /public (e.g. "/brands/dior-logo.png")
// - full URL (e.g. "https://cdn.example.com/brands/dior.png")
const BRAND_LOGO_URL_MAP: Record<string, string> = {
  chanel: "https://i.pinimg.com/1200x/ad/0e/e2/ad0ee27e595ac80e6a40ab2171b971c4.jpg",
  creed: "https://i.pinimg.com/736x/c1/70/b3/c170b3673dbf4c4f70784befe76c3fe4.jpg",
  dior: "https://i.pinimg.com/736x/7f/76/c2/7f76c23d292d95ef1534d9aaf7dcf18f.jpg",
  guerlain: "https://i.pinimg.com/736x/d5/ec/cb/d5eccbd4e373f248ba66c78b4f1f1991.jpg",
  "jo-malone-london": "https://i.pinimg.com/1200x/33/53/00/33530043fb5327eb55618dffe2f4f8e5.jpg",
  "giorgio-armani": "https://i.pinimg.com/1200x/60/aa/53/60aa537c3f7e918c0546a2f1bf469212.jpg",
  "tom-ford": "https://i.pinimg.com/1200x/f2/16/56/f216565eced3d9dbedbbcea38c7d6251.jpg",
  versace: "https://i.pinimg.com/736x/7b/07/74/7b0774593878dde45d9c1e0ec47be646.jpg",
  "yves-saint-laurent": "https://i.pinimg.com/736x/97/66/97/9766975f7d79155664a4adc897cd0cbc.jpg",
  lancome: "https://i.pinimg.com/736x/a0/c1/9e/a0c19ebeaa041585154dc160e7c9ab7b.jpg",
  "ex-nihilo": "https://i.pinimg.com/1200x/2c/39/7c/2c397c8b3736a6d77f7abd33af4fe409.jpg",
  afnan: "https://i.pinimg.com/736x/de/9a/a5/de9aa5d20cc7a73fe6bd04453b2c1166.jpg",
  amouage: "https://i.pinimg.com/736x/23/17/97/23179703458b13c3c59ddda2beee3d1d.jpg",
};

export type BrandRankingItem = {
  rankLabel: string;
  code: string;
  brandName: string;
  brandSlug: string;
  brandLogo: string | null;
  note: string;
};

export type PerfumeRankingItem = {
  rankLabel: string;
  perfumeName: string;
  brandName: string;
  image: string;
  note: string;
};

function normalizeLogoKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getBrandLogo(brandSlug: string, brandName?: string) {
  const bySlug = BRAND_LOGO_URL_MAP[normalizeLogoKey(brandSlug)];
  if (bySlug) return bySlug;

  if (brandName) {
    const byName = BRAND_LOGO_URL_MAP[normalizeLogoKey(brandName)];
    if (byName) return byName;
  }

  return null;
}

export function getPerfumeImage(perfume: Perfume) {
  return (
    perfume.media?.thumbnail ||
    perfume.media?.images?.[0] ||
    getBrandLogo(perfume.brand_slug) ||
    "/dior.jpg"
  );
}

function toCode(value: string) {
  return value
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(3, "-");
}

function createRankMap() {
  return new Map(FRAGRANTICA_TOP_SLUGS.map((slug, index) => [slug, index + 1]));
}

export function buildBrandRanking(perfumes: Perfume[], limit = 8): BrandRankingItem[] {
  const rankMap = createRankMap();

  const selected = perfumes
    .filter((perfume) => rankMap.has(perfume.slug))
    .sort((a, b) => (rankMap.get(a.slug) ?? 999) - (rankMap.get(b.slug) ?? 999));

  const brandMap = new Map<
    string,
    { brandName: string; brandSlug: string; count: number; bestRank: number; examples: string[] }
  >();

  for (const perfume of selected) {
    const brandKey = (perfume.brand_slug || perfume.brand).trim().toLowerCase();
    const rank = rankMap.get(perfume.slug) ?? 999;
    const current = brandMap.get(brandKey);

    if (!current) {
      brandMap.set(brandKey, {
        brandName: perfume.brand,
        brandSlug: perfume.brand_slug,
        count: 1,
        bestRank: rank,
        examples: [perfume.fragrance_name],
      });
      continue;
    }

    current.count += 1;
    current.bestRank = Math.min(current.bestRank, rank);
    if (current.examples.length < 2) {
      current.examples.push(perfume.fragrance_name);
    }
  }

  return Array.from(brandMap.values())
    .sort((a, b) => b.count - a.count || a.bestRank - b.bestRank)
    .slice(0, limit)
    .map((item, index) => ({
      rankLabel: `#${index + 1}`,
      code: toCode(item.brandName),
      brandName: item.brandName,
      brandSlug: item.brandSlug,
      brandLogo: getBrandLogo(item.brandSlug, item.brandName),
      note: `${item.examples.join(" / ")}`,
    }));
}

export function buildTopPerfumeRanking(perfumes: Perfume[], limit = 8): PerfumeRankingItem[] {
  const rankMap = createRankMap();

  return perfumes
    .filter((perfume) => rankMap.has(perfume.slug))
    .sort((a, b) => (rankMap.get(a.slug) ?? 999) - (rankMap.get(b.slug) ?? 999))
    .slice(0, limit)
    .map((perfume) => ({
      rankLabel: `#${rankMap.get(perfume.slug) ?? "-"}`,
      perfumeName: perfume.fragrance_name,
      brandName: perfume.brand,
      image: getPerfumeImage(perfume),
      note: [perfume.category, perfume.concentration, perfume.olfactive_family]
        .filter(Boolean)
        .join(" · "),
    }));
}
