"use client"

import { Check, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { Perfume } from "@/types/perfume"
import { buildBrandRanking, type BrandRankingItem } from "@/lib/perfume-ranking"

const highlights = [
    "Bảng top mùi nổi bật theo lượt mua và lượt đánh giá từ khách hàng",
    "Nhanh. dễ chọn mùi để tối ưu thời gian và ngân sách",
    "Tập trung vào nhóm mùi cụ thể để ra đơn nhanh hơn",
    "Cập nhật để đọc và để triển khai cho team bán hàng",
    "Phù hợp cho bán lẻ, CTV và kênh bán sỉ",
    "Sẵn hàng khi khách hàng cần",
]

export function FeaturesSection() {
    const [topBrands, setTopBrands] = useState<BrandRankingItem[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number>()
    const scrollPosition = useRef(0)
    const lastUpdateTime = useRef(0)

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!scrollRef.current) {
                animationRef.current = requestAnimationFrame(animate)
                return
            }

            if (!lastUpdateTime.current) lastUpdateTime.current = timestamp
            const deltaTime = timestamp - lastUpdateTime.current
            lastUpdateTime.current = timestamp

            scrollPosition.current += (deltaTime / 1000) * 34

            const singleSetHeight = scrollRef.current.scrollHeight / 3

            if (scrollPosition.current >= singleSetHeight) {
                scrollPosition.current = 0
            }

            scrollRef.current.style.transform = `translateY(-${scrollPosition.current}px)`
            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    useEffect(() => {
        let ignore = false

        async function refreshTopPerfumes() {
            try {
                const response = await fetch("/api/perfumes", { cache: "no-store" })
                if (!response.ok) {
                    return
                }

                const data = (await response.json()) as Perfume[]
                if (ignore) return
                setTopBrands(buildBrandRanking(data, 8))
            } catch {
                if (!ignore) {
                    setTopBrands([])
                }
            }
        }

        void refreshTopPerfumes()
        const intervalId = window.setInterval(() => {
            void refreshTopPerfumes()
        }, 300_000)

        return () => {
            ignore = true
            window.clearInterval(intervalId)
        }
    }, [])

    const displayList = topBrands.length
        ? [...topBrands, ...topBrands, ...topBrands]
        : []

    return (
        <section id="features" className="px-6 py-24">
            <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    <div className="order-2 lg:order-1">
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <div>


                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Top brand of ADNz Perfume
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                                        <span className="text-sm font-medium text-foreground">
                                            <img src="/logo/logo.jpg" alt="ADNz logo" className="h-7 w-7 rounded-full object-cover" />
                                        </span>
                                    </div>
                                </div>

                                <div className="relative h-[320px] overflow-hidden">
                                    <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-12 bg-gradient-to-b from-card to-transparent" />

                                    {displayList.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                            Đang tải...
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div ref={scrollRef} className="will-change-transform space-y-0">
                                                {displayList.map((item, i) => (
                                                    <div
                                                        key={`${item.brandName}-${i}`}
                                                        className="flex items-center justify-between border-b border-border py-3"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
                                                                {item.brandLogo ? (
                                                                    <img
                                                                        src={item.brandLogo}
                                                                        alt={item.brandName}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs text-foreground">{item.code}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-foreground">{item.brandName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.note}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-foreground">{item.rankLabel}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-12 bg-gradient-to-t from-card to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 space-y-8 lg:order-2">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] px-4 py-2">
                                <Sparkles className="h-4 w-4 text-black" />
                                <span className="text-xs uppercase tracking-widest text-black">Top Brands</span>
                            </div>
                            <h2 className="mb-6 font-sans text-5xl font-normal text-balance">
                                Bảng top brand nước hoa theo lượt mua
                            </h2>
                            <p className="leading-relaxed text-muted-foreground">
                                Ở đây hiển thị các brand đang có nhiều mùi nằm trong Top, giúp bạn ưu tiên thương hiệu để đẩy nội dung và bán hàng.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {highlights.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border">
                                        <Check className="h-3 w-3 text-foreground" />
                                    </div>
                                    <span className="text-sm text-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
