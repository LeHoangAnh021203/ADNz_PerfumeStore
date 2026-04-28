"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import ElectricBorderCard from "@/components/electric-border-card";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ArrowLeft,
  ArrowRight,
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

const MOBILE_PRODUCTS_PER_PAGE = 10;
const DESKTOP_PRODUCTS_PER_PAGE = 20;

function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages] as const;
}

function ListProductPageContent() {
  const isMobile = useIsMobile();
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = isMobile ? MOBILE_PRODUCTS_PER_PAGE : DESKTOP_PRODUCTS_PER_PAGE;

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

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPerfumes.length / productsPerPage));
  }, [filteredPerfumes.length, productsPerPage]);

  const paginatedPerfumes = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredPerfumes.slice(startIndex, startIndex + productsPerPage);
  }, [filteredPerfumes, currentPage, productsPerPage]);

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
    setShowMobileFilters(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    brandFilter,
    genderFilter,
    categoryFilter,
    concentrationFilter,
    familyFilter,
    popularFilter,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

      <main className="mx-auto max-w-7xl px-3 pb-12 pt-[124px] sm:px-4 md:pb-16 md:pt-20">
        <div className="mb-7 px-1 md:mb-12 md:px-2">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 md:text-sm md:tracking-[0.3em]">
            ADNz Perfume Collection
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white md:mt-4 md:text-6xl">
            Product
          </h1>
          <p className="mt-2 text-sm text-white/50 md:hidden">
            {isLoading ? "Loading products..." : `${filteredPerfumes.length} products`}
          </p>
        </div>

        <section className="mb-6 rounded-[1.5rem] border border-white/10 bg-[#141414] p-4 md:mb-10 md:rounded-[2rem] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 md:text-sm md:tracking-[0.3em]">
                Filter
              </p>
              <div className="mt-3 flex flex-wrap gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => setPopularFilter((value) => !value)}
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition md:px-4 ${
                    popularFilter
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  Top Products
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters((value) => !value)}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 md:hidden"
                >
                  {showMobileFilters ? "Hide filters" : "More filters"}
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white md:px-5"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:mt-6 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
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

            <label className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
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

            <label className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
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

            <label className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
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

            <label className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
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

            <label className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
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
          <div className="grid grid-cols-2 gap-3 md:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {paginatedPerfumes.map((perfume) => (
              <motion.article
                key={perfume._id}
                layoutId={`perfume-${perfume.slug}`}
                className="group relative w-full min-w-0 cursor-pointer"
                onClick={() => setSelectedSlug(perfume.slug)}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <ElectricBorderCard
                  className="h-full"
                  contentClassName="relative m-[6px] rounded-[calc(1.2rem-6px)] bg-[#181818] p-3 transition duration-300 group-hover:bg-[#1b1b1b] md:m-[14px] md:rounded-[calc(2rem-10px)] md:p-6 gap-5"
                >
                  <div className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm md:left-4 md:top-4 md:px-3 md:py-1 md:text-xs md:tracking-[0.2em]">
                    {perfume.gender}
                  </div>
                  <div className="relative h-[9.5rem] overflow-hidden rounded-[1rem] md:h-[24rem] md:rounded-[30%]">
                    <img
                      src={getPerfumeImage(perfume)}
                      alt={perfume.full_name}
                      className="h-full w-full rounded-[1rem] object-contain transition duration-500 group-hover:scale-105 md:rounded-[1.75rem]"
                    />
                  </div>

                  <div className="mt-2 pb-12 md:mt-6 md:pb-20">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/40 md:text-sm md:tracking-[0.2em]">
                      {perfume.brand}
                    </p>
                    <h2 className="mt-1 text-base font-semibold leading-tight text-white md:mt-2 md:text-2xl">
                      {perfume.fragrance_name}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-white/60 md:mt-3 md:min-h-12 md:text-sm md:leading-6">
                      {perfume.olfactive_family || "N/A"}
                    </p>
                    <p className="mt-2 line-clamp-1 text-[11px] text-white/50 md:mt-4 md:text-sm">
                      {formatList(perfume.key_notes.slice(0, 3))}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:text-white md:bottom-6 md:right-6 md:h-11 md:w-11"
                    aria-label={`Open ${perfume.full_name}`}
                  >
                    <Info className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  <button
                    type="button"
                    className="absolute bottom-2.5 right-11 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:text-white md:bottom-6 md:right-20 md:h-11 md:w-11"
                    aria-label={`Copy message and open Meta Business for ${perfume.full_name}`}
                    title="Copy noi dung hoi gia va mo Meta Business"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleBuyClick(perfume);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </ElectricBorderCard>
              </motion.article>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredPerfumes.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2 md:mt-8">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {buildPagination(currentPage, totalPages).map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-11 min-w-10 items-center justify-center px-2 text-sm text-white/55"
                  >
                    ...
                  </span>
                );
              }

              const isActive = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-[#af1f29] bg-[#af1f29] text-white"
                      : "border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:text-white"
                  }`}
                  aria-label={`Page ${item}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
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

            <div className="fixed inset-0 z-50 flex items-end justify-center px-2 pb-0 pt-14 md:px-4 md:pt-16">
              <motion.section
                layoutId={`perfume-${selectedPerfume.slug}`}
                className="relative h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-[1.6rem] border border-white/10 bg-[#111111] p-4 md:h-[92vh] md:rounded-t-[2rem] md:p-12"
                onClick={(event) => event.stopPropagation()}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSlug(null)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:text-white md:right-6 md:top-6 md:h-10 md:w-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="grid gap-6 md:gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="overflow-hidden rounded-[1.4rem] bg-black/30 p-3 md:rounded-[20%] md:p-6">
                    <img
                      src={getPerfumeImage(selectedPerfume)}
                      alt={selectedPerfume.full_name}
                      className="h-[300px] w-full rounded-[1.2rem] object-contain md:h-[420px] md:rounded-[20%]"
                    />
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                      {selectedPerfume.brand}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:mt-4 md:text-4xl">
                      {selectedPerfume.fragrance_name}
                    </h2>
                    <p className="mt-3 text-sm text-white/60 md:mt-4 md:text-base">
                      {selectedPerfume.concentration || "Perfume"} ·{" "}
                      {selectedPerfume.gender} · {selectedPerfume.category}
                    </p>
                    <p className="mt-5 text-base leading-7 text-white/70 md:mt-8 md:text-lg md:leading-8">
                      {selectedPerfume.official_description_excerpt}
                    </p>

                    <div className="mt-6 grid gap-4 md:mt-10 md:gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:rounded-3xl md:p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Olfactive Family
                        </p>
                        <p className="mt-2 text-base text-white md:mt-3 md:text-lg">
                          {selectedPerfume.olfactive_family}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:rounded-3xl md:p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Key Notes
                        </p>
                        <p className="mt-2 text-base text-white md:mt-3 md:text-lg">
                          {formatList(selectedPerfume.key_notes)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:mt-6 md:gap-6 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:rounded-3xl md:p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Top Notes
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {formatList(selectedPerfume.top_notes) || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:rounded-3xl md:p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Middle Notes
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {formatList(selectedPerfume.middle_notes) || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:rounded-3xl md:p-6">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          Base Notes
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {formatList(selectedPerfume.base_notes) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-10 md:gap-4">
                      <a
                        href={selectedPerfume.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 sm:w-auto"
                      >
                        Official Source
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      <a
                        href={metaBusinessUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white sm:w-auto"
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
