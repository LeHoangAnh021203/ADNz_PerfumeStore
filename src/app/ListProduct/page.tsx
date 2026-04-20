"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import ElectricBorderCard from "@/components/electric-border-card";
import { toast } from "@/hooks/use-toast";
import {
  ExternalLink,
  Info,
  Loader2,
  ShoppingCart,
  X,
} from "@/components/ui/lucide-icons";
import type { Perfume } from "@/types/perfume";

const brandImageMap: Record<string, string> = {
  chanel: "/8407f62a82e0c169ac0b7f94a1e7be26.jpg",
  creed: "/creed-product.jpg",
  dior: "/dior.jpg",
  guerlain: "/guerlain.jpg",
  "jo-malone-london": "/jo.jpg",
  "giorgio-armani": "/GA.jpg",
  "tom-ford": "/tf.jpg",
  versace: "/versace.jpg",
  "yves-saint-laurent": "/saintlaurent.jpg",
  lancome: "/lancome.jpg",
};

function getPerfumeImage(perfume: Perfume) {
  return (
    perfume.media?.thumbnail ||
    perfume.media?.images?.[0] ||
    brandImageMap[perfume.brand_slug] ||
    "/dior.jpg"
  );
}

function formatList(values: string[]) {
  return values.filter(Boolean).join(", ");
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function resolveFilterOption(options: string[], rawValue: string) {
  const normalizedTarget = normalizeFilterValue(rawValue);
  return (
    options.find((option) => normalizeFilterValue(option) === normalizedTarget) ??
    rawValue
  );
}

function getPerfumeImageUrl(perfume: Perfume) {
  const image = getPerfumeImage(perfume);

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (typeof window === "undefined") {
    return image;
  }

  return new URL(image, window.location.origin).toString();
}

const metaBusinessUrl =
  process.env.NEXT_PUBLIC_META_BUSINESS_URL ||
  "https://www.facebook.com/profile.php?id=61573770329166";

const fragranticaPopularSlugs = new Set([
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
]);

function ListProductPageContent() {
  const searchParams = useSearchParams();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [concentrationFilter, setConcentrationFilter] = useState("all");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [popularFilter, setPopularFilter] = useState(false);

  useEffect(() => {
    async function fetchPerfumes() {
      try {
        const response = await fetch("/api/perfumes", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Không thể tải danh sách perfume.");
        }

        const data = (await response.json()) as Perfume[];
        setPerfumes(data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Không thể tải danh sách perfume."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPerfumes();
  }, []);

  const selectedPerfume = useMemo(
    () => perfumes.find((perfume) => perfume.slug === selectedSlug) ?? null,
    [perfumes, selectedSlug]
  );

  const filterOptions = useMemo(() => {
    const getOptions = (values: Array<string | null | undefined>) =>
      [...new Set(values.filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b)
      );

    return {
      brands: getOptions(perfumes.map((perfume) => perfume.brand)),
      genders: getOptions(perfumes.map((perfume) => perfume.gender)),
      categories: getOptions(perfumes.map((perfume) => perfume.category)),
      concentrations: getOptions(
        perfumes.map((perfume) => perfume.concentration)
      ),
      families: getOptions(
        perfumes.map((perfume) => perfume.olfactive_family)
      ),
    };
  }, [perfumes]);

  useEffect(() => {
    const brandFromUrl = searchParams.get("brand");

    if (!brandFromUrl) {
      setBrandFilter("all");
      return;
    }

    setBrandFilter(resolveFilterOption(filterOptions.brands, brandFromUrl));
  }, [searchParams, filterOptions.brands]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");

    if (!categoryFromUrl) {
      setCategoryFilter("all");
      return;
    }

    setCategoryFilter(
      resolveFilterOption(filterOptions.categories, categoryFromUrl)
    );
  }, [searchParams, filterOptions.categories]);

  const filteredPerfumes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return perfumes.filter((perfume) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          perfume.brand,
          perfume.fragrance_name,
          perfume.full_name,
          perfume.olfactive_family,
          perfume.category,
          perfume.gender,
          perfume.concentration,
          ...perfume.key_notes,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedQuery)
          );

      const matchesBrand =
        brandFilter === "all" || perfume.brand === brandFilter;
      const matchesGender =
        genderFilter === "all" || perfume.gender === genderFilter;
      const matchesCategory =
        categoryFilter === "all" || perfume.category === categoryFilter;
      const matchesConcentration =
        concentrationFilter === "all" ||
        perfume.concentration === concentrationFilter;
      const matchesFamily =
        familyFilter === "all" || perfume.olfactive_family === familyFilter;
      const matchesPopular =
        !popularFilter || fragranticaPopularSlugs.has(perfume.slug);

      return (
        matchesSearch &&
        matchesBrand &&
        matchesGender &&
        matchesCategory &&
        matchesConcentration &&
        matchesFamily &&
        matchesPopular
      );
    });
  }, [
    perfumes,
    searchQuery,
    brandFilter,
    genderFilter,
    categoryFilter,
    concentrationFilter,
    familyFilter,
    popularFilter,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    brandFilter !== "all" ||
    genderFilter !== "all" ||
    categoryFilter !== "all" ||
    concentrationFilter !== "all" ||
    familyFilter !== "all" ||
    popularFilter;

  const resetFilters = () => {
    setSearchQuery("");
    setBrandFilter("all");
    setGenderFilter("all");
    setCategoryFilter("all");
    setConcentrationFilter("all");
    setFamilyFilter("all");
    setPopularFilter(false);
  };

  const handleBuyClick = async (perfume: Perfume) => {
    const message = [
      "Tôi cần báo giá sản phẩm này:",
      `- ${perfume.full_name}`,
      perfume.concentration ? `- Nồng độ: ${perfume.concentration}` : null,
      `- Giới tính: ${perfume.gender}`,
      perfume.olfactive_family
        ? `- Olfactive family: ${perfume.olfactive_family}`
        : null,
      `- Ảnh sản phẩm: ${getPerfumeImageUrl(perfume)}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Da copy noi dung hoi gia",
        description:
          "Chi can mo Meta Business va dan vao o tin nhan de gui cho shop.",
      });
    } catch {
      toast({
        title: "Mo Meta Business",
        description:
          "Khong copy duoc tu dong. Hay nhan tin thu cong trong cua so Meta vua mo.",
      });
    }

    window.open(metaBusinessUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 px-2">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            ADNz Perfume Collection
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Product
          </h1>
          
        </div>

        <section className="mb-10 rounded-[2rem] border border-white/10 bg-[#141414] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                Filter
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPopularFilter((value) => !value)}
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                    popularFilter
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  Top Products
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Search
              </span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Brand, fragrance, notes..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Brand
              </span>
              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option value="all">All brands</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Gender
              </span>
              <select
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option value="all">All genders</option>
                {filterOptions.genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Category
              </span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option value="all">All categories</option>
                {filterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Concentration
              </span>
              <select
                value={concentrationFilter}
                onChange={(event) => setConcentrationFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option value="all">All concentrations</option>
                {filterOptions.concentrations.map((concentration) => (
                  <option key={concentration} value={concentration}>
                    {concentration}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Olfactive Family
              </span>
              <select
                value={familyFilter}
                onChange={(event) => setFamilyFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option value="all">All families</option>
                {filterOptions.families.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-white/60">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Uploads perfume ...
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && filteredPerfumes.length > 0 && (
          <div className="grid gap-8 justify-items-center md:grid-cols-2 xl:grid-cols-3">
            {filteredPerfumes.map((perfume) => (
              <motion.article
                key={perfume._id}
                layoutId={`perfume-${perfume.slug}`}
                className="group relative w-full max-w-[25rem] cursor-pointer"
                onClick={() => setSelectedSlug(perfume.slug)}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <ElectricBorderCard
                  className="h-full"
                  contentClassName="relative m-[14px] rounded-[calc(2rem-10px)] bg-[#181818] p-6 transition duration-300 group-hover:bg-[#1b1b1b gap-5"
                >
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                    {perfume.gender}
                  </div>
                  <div className="relative h-[24rem] overflow-hidden rounded-[30%] ">
                    <img
                      src={getPerfumeImage(perfume)}
                      alt={perfume.full_name}
                      className="h-full w-full rounded-[1.75rem] object-contain transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-6 pb-20">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/40">
                      {perfume.brand}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
                      {perfume.fragrance_name}
                    </h2>
                    <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-white/60">
                      {perfume.olfactive_family || "N/A"}
                    </p>
                    <p className="mt-4 text-sm text-white/50">
                      {formatList(perfume.key_notes.slice(0, 3))}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:text-white"
                    aria-label={`Open ${perfume.full_name}`}
                  >
                    <Info className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    className="absolute bottom-6 right-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:text-white"
                    aria-label={`Copy message and open Meta Business for ${perfume.full_name}`}
                    title="Copy noi dung hoi gia va mo Meta Business"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleBuyClick(perfume);
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </ElectricBorderCard>
              </motion.article>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredPerfumes.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-[#141414] p-10 text-center">
            <p className="text-lg font-medium text-white">
              No perfumes match the current filters.
            </p>
            <p className="mt-3 text-white/60">
              Try another brand, category, concentration, or clear the filters.
            </p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedPerfume && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSlug(null)}
            />

            <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pt-16">
              <motion.section
                layoutId={`perfume-${selectedPerfume.slug}`}
                className="relative h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#111111] p-8 md:p-12"
                onClick={(event) => event.stopPropagation()}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="overflow-hidden rounded-[20%] bg-black/30 p-6">
                    <img
                      src={getPerfumeImage(selectedPerfume)}
                      alt={selectedPerfume.full_name}
                      className="h-[420px] w-full rounded-[20%] object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                      {selectedPerfume.brand}
                    </p>
                    <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                      {selectedPerfume.fragrance_name}
                    </h2>
                    <p className="mt-4 text-white/60">
                      {selectedPerfume.concentration || "Perfume"} ·{" "}
                      {selectedPerfume.gender} · {selectedPerfume.category}
                    </p>
                    <p className="mt-8 text-lg leading-8 text-white/70">
                      {selectedPerfume.official_description_excerpt}
                    </p>

                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Olfactive Family
                        </p>
                        <p className="mt-3 text-lg text-white">
                          {selectedPerfume.olfactive_family}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Key Notes
                        </p>
                        <p className="mt-3 text-lg text-white">
                          {formatList(selectedPerfume.key_notes)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Top Notes
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {formatList(selectedPerfume.top_notes) || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Middle Notes
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {formatList(selectedPerfume.middle_notes) || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Base Notes
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {formatList(selectedPerfume.base_notes) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-4">
                      <a
                        href={selectedPerfume.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                      >
                        Official Source
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      <a
                        href={metaBusinessUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                      >
                        Want to buy
                        <ShoppingCart className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function ListProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] text-white">
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-16">
            <div className="flex items-center justify-center py-24 text-white/60">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Đang tải perfume...
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ListProductPageContent />
    </Suspense>
  );
}
