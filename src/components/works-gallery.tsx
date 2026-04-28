"use client"

import { useState } from "react"
import { VideoCard } from "./video-card"
import { CustomCursor } from "./custom-cursor"

const projects = [
    {
        id: 1,
        title: "Tester",
        category: "Tester perfume is an authentic fragrance made by the brand for in-store sampling, identical in scent to the retail version but usually packaged more simply and sold at a lower price.",
        year: "Inbox",
        thumbnail: "https://i.pinimg.com/1200x/95/89/bc/9589bc68360997b4a24cf6ed1127c73d.jpg",
        video: "/video/tester.mp4",
        ctaUrl: "https://zalo.me/0342988398",
    },
    {
        id: 2,
        title: "Refill",
        category: "Refill perfume is an authentic fragrance sold as a replacement liquid for an existing bottle, allowing users to reuse the original container instead of buying a new one.",
        year: "Inbox",
        thumbnail: "https://i.pinimg.com/736x/7d/e7/20/7de72059a3cf8ceeaa6dd7f9c38ac10c.jpg",
        video: "/video/refill.mp4",
        ctaUrl: "https://zalo.me/0342988398",
    },
    {
        id: 3,
        title: "Showcase",
        category: "A showcase perfume is an authentic fragrance unit used for display in stores, typically opened and lightly used for presentation or customer testing, but still in near-full condition.",
        year: "Inbox",
        thumbnail: "https://i.pinimg.com/736x/0e/3f/08/0e3f084e0443a3d6a15233cd39227baf.jpg",
        video: "/video/showcase.mp4",
        ctaUrl: "https://zalo.me/0342988398",
    },
   
]

export function WorksGallery() {
    const [hoveredId, setHoveredId] = useState<number | null>(null)

    return (
        <>
            <div className="hidden md:block">
                <CustomCursor isActive={hoveredId !== null} />
            </div>
            <div className="container mx-auto px-0 sm:px-2 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
                    {projects.map((project) => (
                        <VideoCard
                            key={project.id}
                            project={project}
                            isHovered={hoveredId === project.id}
                            onHoverChange={(hovered) => setHoveredId(hovered ? project.id : null)}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
