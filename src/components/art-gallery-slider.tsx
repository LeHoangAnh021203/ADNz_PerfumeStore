"use client"

import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArtworkCard } from "./artwork-card"
import { NavigationDots } from "./navigation-dots"
import { artworks } from "@/data/artwork"
import { useSliderNavigation } from "@/hooks/use-slider-navigation"
import { useSliderDrag } from "@/hooks/use-slider-drag"
import { useSliderWheel } from "@/hooks/use-slider-wheel"
import { useColorExtraction, useCurrentColors } from "@/hooks/use-color-extraction"
import { useIsMobile } from "@/hooks/use-mobile"

export function ArtGallerySlider() {
    const sliderRef = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()
    const router = useRouter()

    const brandRouteMap: Record<string, string> = {
        CHANEL: "Chanel",
        DIOR: "Dior",
        GUERLAIN: "Guerlain",
        "Yves SAINT LAURENT": "Yves Saint Laurent",
        "GIORGIO ARMANI": "Giorgio Armani",
        VERSACE: "Versace",
        "TOM FORD": "Tom Ford",
        CREED: "Creed",
        "JO MALONE LONDON": "Jo Malone London",
        "LANCÔME": "Lancôme",
    }

    const { currentIndex, goToNext, goToPrev, goToSlide } = useSliderNavigation({
        totalSlides: artworks.length,
        enableKeyboard: true,
    })

    const { isDragging, dragX, handleDragStart, handleDragMove, handleDragEnd } = useSliderDrag({
        onSwipeLeft: goToNext,
        onSwipeRight: goToPrev,
    })

    useSliderWheel({
        sliderRef,
        onScrollLeft: goToNext,
        onScrollRight: goToPrev,
    })

    const colors = useColorExtraction(artworks)
    const currentColors = useCurrentColors(colors, artworks[currentIndex]?.id)
    const slideWidth = isMobile ? 292 : 564

    const handleBrandClick = (title: string) => {
        const brand = brandRouteMap[title]

        if (!brand) {
            return
        }

        router.push(`/ListProduct?brand=${encodeURIComponent(brand)}`)
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Animated ambient background */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0"
                    style={{
                        background: `
              radial-gradient(ellipse at 30% 20%, ${currentColors[0]}66 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, ${currentColors[1]}66 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, ${currentColors[2]}44 0%, transparent 70%),
              linear-gradient(180deg, #0a0a0a 0%, #111111 100%)
            `,
                    }}
                />
            </AnimatePresence>

            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-3xl" />

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h1 className="font-serif text-lg font-bold tracking-tight text-white/90 md:text-2xl">Top 10 of brands</h1>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md md:px-4 md:py-2"
                >
                    <span className="text-xs text-white/60 md:text-sm">{String(currentIndex + 1).padStart(2, "0")}</span>
                    <span className="text-white/30">/</span>
                    <span className="text-xs text-white/40 md:text-sm">{String(artworks.length).padStart(2, "0")}</span>
                </motion.div>
            </header>

            {/* Slider */}
            <div
                ref={sliderRef}
                className="relative flex h-full w-full cursor-grab items-center active:cursor-grabbing"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                <motion.div
                    className="flex items-center gap-4 px-[calc(50vw-136px)] md:gap-16 md:px-[calc(50vw-250px)]"
                    animate={{
                        x: -currentIndex * slideWidth + dragX,
                    }}
                    transition={isDragging ? { duration: 0 } : { duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                >
                    {artworks.map((artwork, index) => (
                        <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            isActive={index === currentIndex}
                            dragOffset={dragX}
                            index={index}
                            currentIndex={currentIndex}
                            isMobile={isMobile}
                            onClick={() => handleBrandClick(artwork.title)}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Navigation dots */}
            <NavigationDots total={artworks.length} current={currentIndex} onSelect={goToSlide} colors={currentColors} />

            {/* Keyboard hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-8 hidden items-center gap-3 text-white/30 md:flex"
            >
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">←</kbd>
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">→</kbd>
                <span className="text-xs">navigate</span>
            </motion.div>
        </div>
    )
}
