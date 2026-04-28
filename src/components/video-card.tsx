"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Project {
    id: number
    title: string
    category: string
    year: string
    thumbnail: string
    video: string
    ctaUrl?: string
}

interface VideoCardProps {
    project: Project
    isHovered: boolean
    onHoverChange: (hovered: boolean) => void
}

export function VideoCard({ project, isHovered, onHoverChange }: VideoCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)

    useEffect(() => {
        if (isHovered && videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play().catch(() => { })
        } else if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }, [isHovered])

    return (
        <div
            className={cn(
                "group relative rounded-[2.5rem] overflow-hidden",
                "cursor-default md:cursor-none",
                "transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                "h-[420px] w-full md:h-[600px] md:min-w-[180px]",
                isHovered ? "md:flex-[2] shadow-2xl shadow-white/10" : "md:flex-[0.8] md:opacity-90",
            )}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
        >
            {/* Thumbnail Image */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    isHovered ? "md:opacity-0" : "opacity-100",
                )}
            >
                <img
                    src={project.thumbnail || "/placeholder.svg"}
                    alt={project.title}
                    className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        !isHovered && "md:grayscale md:brightness-75",
                    )}
                />
            </div>

            {/* Video */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    isHovered ? "md:opacity-100" : "md:opacity-0",
                )}
            >
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsVideoLoaded(true)}
                >
                    <source src={project.video} type="video/mp4" />
                </video>
            </div>

            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8",
                    "transition-all duration-700",
                    isHovered ? "md:opacity-100" : "md:opacity-0 md:pointer-events-none",
                )}
            >
                {/* Glassmorphic card */}
                <div
                    className={cn(
                        "relative rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl sm:p-5 md:p-6",
                        "shadow-2xl",
                        "transition-all duration-700 ease-out",
                        isHovered ? "md:translate-y-0 md:opacity-100" : "md:translate-y-8 md:opacity-0",
                    )}
                >
                    <div className="space-y-1 text-left">
                        <h3 className="font-mono text-xs font-medium uppercase leading-relaxed tracking-[0.22em] text-white sm:text-sm sm:tracking-[0.3em]">
                            {project.title}
                        </h3>
                        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-white/85 sm:text-xs sm:tracking-[0.25em]">
                            {project.category}
                        </p>
                        <div className="pt-3 mt-3 border-t border-white/10">
                            {project.ctaUrl ? (
                                <a
                                    href={project.ctaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-full border border-white/25 px-3 py-1.5 text-white/80 font-mono text-xs tracking-widest transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    {project.year}
                                </a>
                            ) : (
                                <p className="text-white/60 font-mono text-xs tracking-widest">{project.year}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
