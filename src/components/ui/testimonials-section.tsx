"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Perfume } from "@/types/perfume";
import { buildTopPerfumeRanking, type PerfumeRankingItem } from "@/lib/perfume-ranking";

export function TestimonialsSection() {
  const [topPerfumes, setTopPerfumes] = useState<PerfumeRankingItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let animationFrameId: number;

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 0.8;
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, topPerfumes.length]);

  useEffect(() => {
    let ignore = false;

    async function refreshTopPerfumes() {
      try {
        const response = await fetch("/api/perfumes", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as Perfume[];
        if (ignore) return;

        setTopPerfumes(buildTopPerfumeRanking(data, 10));
      } catch {
        if (!ignore) setTopPerfumes([]);
      }
    }

    void refreshTopPerfumes();
    const intervalId = window.setInterval(() => {
      void refreshTopPerfumes();
    }, 300_000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const duplicatedPerfumes = useMemo(
    () => [...topPerfumes, ...topPerfumes, ...topPerfumes],
    [topPerfumes]
  );

  return (
    <section id="top-perfumes" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
          <div className="lg:w-1/3">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] px-4 py-2">
              <Sparkles className="h-4 w-4 text-black" />
              <span className="text-xs uppercase tracking-widest text-black">Top Perfumes</span>
            </div>
            <h2 className="font-sans text-5xl font-normal leading-tight">Top nước hoa nổi bật</h2>
            
          </div>

          <div className="relative lg:w-2/3">
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

            {duplicatedPerfumes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Đang tải...
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                style={{ scrollBehavior: "auto" }}
              >
                {duplicatedPerfumes.map((item, index) => (
                  <article
                    key={`${item.perfumeName}-${index}`}
                    className="flex w-full flex-shrink-0 items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:w-[420px]"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-black/20">
                      <img
                        src={item.image}
                        alt={item.perfumeName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{item.rankLabel}</p>
                      <h3 className="truncate text-lg text-foreground">{item.perfumeName}</h3>
                      <p className="truncate text-sm text-muted-foreground">{item.brandName}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
