"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Link from "next/link"

const FRAME_COUNT = 240
const IMAGE_PATH = "/frames/"

function getFramePath(index: number): string {
    const paddedIndex = (index + 1).toString().padStart(5, "0")
    return `${IMAGE_PATH}${paddedIndex}.jpg`
}

export default function HeadphoneScroll() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [images, setImages] = useState<HTMLImageElement[]>([])
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)
    const [successCount, setSuccessCount] = useState(0)
    const [isMobile, setIsMobile] = useState<boolean | null>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["0 0", "end end"],
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    useEffect(() => {
        const updateViewport = () => {
            setIsMobile(window.innerWidth < 768)
        }

        updateViewport()
        window.addEventListener("resize", updateViewport)
        return () => window.removeEventListener("resize", updateViewport)
    }, [])

    // Preload all images
    useEffect(() => {
        if (isMobile === null) return

        setImages([])
        setIsLoaded(false)
        setLoadingProgress(0)
        setSuccessCount(0)

        const loadedImages: HTMLImageElement[] = []
        let loadedCount = 0
        let successfulLoads = 0
        const frameStep = isMobile ? 4 : 1
        const frameIndexes = Array.from({ length: Math.ceil(FRAME_COUNT / frameStep) }, (_, i) => i * frameStep)
        const totalFrames = frameIndexes.length

        frameIndexes.forEach((frameIndex, imageIndex) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = getFramePath(frameIndex)

            img.onload = () => {
                loadedCount++
                successfulLoads++
                setLoadingProgress(Math.round((loadedCount / totalFrames) * 100))
                setSuccessCount(successfulLoads)

                if (loadedCount === totalFrames && successfulLoads > 0) {
                    setImages(loadedImages)
                    setIsLoaded(true)
                }
            }

            img.onerror = () => {
                loadedCount++
                setLoadingProgress(Math.round((loadedCount / totalFrames) * 100))

                if (loadedCount === totalFrames && successfulLoads > 0) {
                    setImages(loadedImages)
                    setIsLoaded(true)
                }
            }

            loadedImages[imageIndex] = img
        })
    }, [isMobile])

    // Draw frame to canvas
    useEffect(() => {
        if (!isLoaded || images.length === 0) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const render = () => {
            const frameIndex = Math.min(images.length - 1, Math.max(0, Math.floor(smoothProgress.get() * (images.length - 1))))

            const img = images[frameIndex]
            if (!img || !img.complete || img.naturalWidth === 0) return

            // Set canvas size to match image aspect ratio
            const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
            const containerWidth = canvas.clientWidth
            const containerHeight = canvas.clientHeight

            canvas.width = containerWidth * dpr
            canvas.height = containerHeight * dpr

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, containerWidth, containerHeight)

            const imgAspect = img.width / img.height
            const canvasAspect = containerWidth / containerHeight

            let drawWidth, drawHeight, drawX, drawY

            if (isMobile) {
                // Mobile: contain to avoid extreme crop/zoom on tall viewports.
                if (imgAspect > canvasAspect) {
                    drawWidth = containerWidth
                    drawHeight = containerWidth / imgAspect
                    drawX = 0
                    drawY = (containerHeight - drawHeight) / 2
                } else {
                    drawHeight = containerHeight
                    drawWidth = containerHeight * imgAspect
                    drawX = (containerWidth - drawWidth) / 2
                    drawY = 0
                }
            } else if (imgAspect > canvasAspect) {
                drawHeight = containerHeight
                drawWidth = containerHeight * imgAspect
                drawX = (containerWidth - drawWidth) / 2
                drawY = 0
            } else {
                drawWidth = containerWidth
                drawHeight = containerWidth / imgAspect
                drawX = 0
                drawY = (containerHeight - drawHeight) / 2
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        }

        render()
        const unsubscribe = smoothProgress.on("change", render)

        window.addEventListener("resize", render)
        return () => {
            unsubscribe()
            window.removeEventListener("resize", render)
        }
    }, [isLoaded, images, isMobile, smoothProgress])

    const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
    const precisionOpacity = useTransform(scrollYProgress, [0.18, 0.28, 0.42, 0.52], [0, 1, 1, 0])
    const titaniumOpacity = useTransform(scrollYProgress, [0.52, 0.62, 0.76, 0.86], [0, 1, 1, 0])
    const finalOpacity = useTransform(scrollYProgress, [0.88, 0.95], [0, 1])

    return (
        <>
            {/* Loading Screen */}
            {!isLoaded && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
                    <div className="mb-4 text-xl font-medium tracking-tight text-white/80">ADNz Perfume</div>
                    <div className="mb-6">
                        <motion.div
                            className="h-[2px] w-56 overflow-hidden rounded-full bg-white/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.div
                                className="h-full bg-white/80"
                                initial={{ width: 0 }}
                                animate={{ width: `${loadingProgress}%` }}
                                transition={{ duration: 0.2 }}
                            />
                        </motion.div>
                    </div>
                    <motion.p
                        className="font-mono text-xs tracking-widest text-white/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        Loading {loadingProgress}%
                    </motion.p>
                    {loadingProgress === 100 && successCount === 0 && (
                        <motion.p className="mt-4 text-xs text-red-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            No images loaded. Check image paths.
                        </motion.p>
                    )}
                </div>
            )}

            {/* Scroll Container */}
            <div ref={containerRef} className={`relative w-full ${isMobile ? "h-[420vh]" : "h-[700vh]"}`}>
                {/* Sticky Canvas */}
                <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
                    <img
                        src={getFramePath(0)}
                        alt=""
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-3xl object-contain md:object-cover"
                    />
                    <canvas ref={canvasRef} className="relative h-[90%] w-[90%] rounded-3xl" />

                    {/* Text Overlays */}
                    <div className="pointer-events-none absolute inset-0">
                        <motion.div className="absolute inset-x-0 bottom-0" style={{ opacity: titleOpacity }}>
                            {/* Gradient backdrop for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

                            <div className="relative px-5 pb-20 md:px-12 md:pb-20 lg:px-20">
                                <motion.p
                                    className="mb-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-white/70"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    Introducing
                                </motion.p>
                                <motion.h1
                                    className="text-5xl font-bold tracking-tighter text-white md:text-8xl lg:text-9xl"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
                                >
                                    ADNz
                                </motion.h1>
                                <motion.p
                                    className="mt-3 max-w-md text-sm font-normal tracking-wide text-white/70 md:mt-4 md:text-lg"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                >
                                    Perfume Store From Viet Nam
                                </motion.p>
                                <motion.div
                                    className="mt-8 flex items-center gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 0.6 }}
                                >
                                    <div className="h-px w-8 bg-white/30" />
                                    <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
                                        Scroll to explore
                                    </span>
                                    <motion.span
                                        className="text-white/50"
                                        animate={{ y: [0, 4, 0] }}
                                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                                    >
                                        ↓
                                    </motion.span>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div className="absolute bottom-0 left-0 right-0" style={{ opacity: precisionOpacity }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
                            <div className="relative px-5 pb-20 md:px-12 md:pb-20 lg:px-20">
                                <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">01</p>
                                <h2
                                    className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
                                    style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
                                >
                                    Creativity in
                                    <br />
                                    Scent.
                                </h2>
                                <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/60 md:mt-4 md:max-w-sm md:text-base">
                                    Diverse product sources and diverse scents to suit all customers.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div className="absolute bottom-0 left-0 right-0" style={{ opacity: titaniumOpacity }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
                            <div className="relative flex justify-end px-5 pb-20 md:px-12 md:pb-20 lg:px-20">
                                <div className="text-right">
                                    <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">02</p>
                                    <h2
                                        className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
                                        style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
                                    >
                                        Diversity in
                                        <br />
                                        Identity.
                                    </h2>
                                    <p className="ml-auto mt-3 max-w-xs text-xs leading-relaxed text-white/60 md:mt-4 md:max-w-sm md:text-base">
                                        Offering many different identities, you are free to choose
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className="absolute bottom-0 left-0 right-0" style={{ opacity: finalOpacity }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                            <div className="relative px-5 pb-20 md:px-12 md:pb-20 lg:px-20">
                                <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">03</p>
                                <h2
                                    className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
                                    style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
                                >
                                    Stable in Price
                                </h2>
                                <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/60 md:mt-4 md:max-w-md md:text-base">
                                    Committed to stable and affordable prices, reputable and quality goods sources
                                </p>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pointer-events-auto mt-6 md:mt-8">
                                    <Link
                                        href="/ListProduct"
                                        className="inline-block rounded-full bg-white px-6 py-3 text-xs font-semibold tracking-wide text-black transition-all hover:bg-white/90 md:px-8 md:py-4 md:text-sm"
                                    >
                                        Shopping Now
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    )
}
