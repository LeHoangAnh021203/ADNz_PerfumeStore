"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { projects as initialProjects, type Project } from "../../lib/data"
import { ProjectFolder } from "../../components/project-folder"
import { Toaster } from "sonner"
import { FullpageLoader } from "../../components/fullpage-loader"
import { useGeneration } from "../../contexts/generation-context"
import { motion } from "framer-motion"
import { NewProjectSlot } from "../../components/new-project-slot"
import { Footer } from "@/components/ui/footer"

function normalizeCategory(value: string) {
    return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
}

function isSpecialInventoryCategory(title: string) {
    const normalized = title.trim().toLowerCase()
    return normalized.includes("tester") || normalized.includes("refill") || normalized.includes("showcase")
}

function isSoftwareSupportCategory(title: string) {
    return title.trim().toLowerCase() === "software support"
}

const PROJECT_CONFIGS = [
    {
        title: "How to Design a Fashion Brand",
        clipCount: 6,
        images: [
            "/newbrand-portrait-1.png",
            "/newbrand-portrait-2.png",
            "/newbrand-portrait-3.png",
            "/newbrand-portrait-4.png",
            "/newbrand-portrait-5.png",
        ],
    },
    {
        title: "Starting a Modern Company in New York",
        clipCount: 8,
        images: [
            "/brand-portrait-1.png",
            "/brand-portrait-2.png",
            "/brand-portrait-3.png",
            "/brand-portrait-4.png",
            "/brand-portrait-5.png",
        ],
    },
]

export default function ClipsPage({ includeFooter = true }: { includeFooter?: boolean }) {
    const { startGeneration } = useGeneration()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [newProjects, setNewProjects] = useState<(Project & { isNew?: boolean; isVisible?: boolean })[]>([])
    const [projects, setProjects] = useState(initialProjects)
    const [categoryBottleCounts, setCategoryBottleCounts] = useState<Record<string, number>>({})
    const nextProjectIndexRef = useRef(0)
    const animatingRef = useRef(false)
    const [showContent, setShowContent] = useState(false)
    const mainRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const hasNewInvisible = newProjects.some((p) => p.isNew && !p.isVisible)
        if (hasNewInvisible && !animatingRef.current) {
            animatingRef.current = true
            const timer = setTimeout(() => {
                setNewProjects((prev) => prev.map((p) => (p.isNew && !p.isVisible ? { ...p, isVisible: true } : p)))
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [newProjects])

    useEffect(() => {
        const hasVisibleNew = newProjects.some((p) => p.isNew && p.isVisible)
        if (hasVisibleNew) {
            const timer = setTimeout(() => {
                setNewProjects((prev) => prev.map((p) => ({ ...p, isNew: false })))
                animatingRef.current = false
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [newProjects])

    const allProjects = useMemo(() => {
        const merged = [...newProjects, ...projects]
        return merged.map((project) => {
            const key = normalizeCategory(project.title)
            const countFromMongo = categoryBottleCounts[key]
            if (typeof countFromMongo !== "number") {
                return project
            }
            return {
                ...project,
                clipCount: countFromMongo,
            }
        })
    }, [newProjects, projects, categoryBottleCounts])

    useEffect(() => {
        let cancelled = false

        async function fetchCountsFromMongo() {
            try {
                // Dedicated aggregation endpoint — much faster, no full collection fetch
                const response = await fetch("/api/category-counts", { cache: "no-store" })
                if (!response.ok) return

                const rawCounts = (await response.json()) as Record<string, number>
                const nextCounts: Record<string, number> = {}

                // Normalize raw MongoDB category keys to match project titles
                for (const [category, count] of Object.entries(rawCounts)) {
                    const key = normalizeCategory(category)
                    if (!key) continue
                    // Accumulate in case multiple raw values normalize to same key
                    nextCounts[key] = (nextCounts[key] || 0) + count
                }

                if (!cancelled) {
                    setCategoryBottleCounts(nextCounts)
                }
            } catch {
                // Keep fallback counts from data.ts when API is unavailable.
            }
        }

        fetchCountsFromMongo()

        return () => {
            cancelled = true
        }
    }, [])

    const handleCreateProject = useCallback(() => {
        const timestamp = Date.now()
        const configIndex = nextProjectIndexRef.current
        const config = PROJECT_CONFIGS[configIndex]

        nextProjectIndexRef.current = (configIndex + 1) % PROJECT_CONFIGS.length

        const newProject: Project & { isNew: boolean; isVisible?: boolean } = {
            id: `new-project-${timestamp}`,
            title: config.title,
            clipCount: config.clipCount,
            images: config.images,
            isGenerating: true,
            progress: 0,
            isNew: true,
            isVisible: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        setNewProjects((prev) => [newProject, ...prev])

        startGeneration(newProject.id, () => {
            setNewProjects((prev) => prev.map((p) => (String(p.id) === newProject.id ? { ...p, isGenerating: false } : p)))
        })
    }, [startGeneration])

    const handleRemoveFolder = useCallback((projectId: string) => {
        // Remove immediately - the exit animation is already handled in DefaultProject
        setNewProjects((prev) => prev.filter((p) => String(p.id) !== projectId))
        setProjects((prev) => prev.filter((p) => String(p.id) !== projectId))
    }, [])

    const handleFolderClick = useCallback(
        (categoryTitle: string) => {
            if (isSpecialInventoryCategory(categoryTitle)) {
                router.push("/category/tester-refill-showcase")
                return
            }
            if (isSoftwareSupportCategory(categoryTitle)) {
                router.push("/software-support")
                return
            }
            router.push(`/ListProduct?category=${encodeURIComponent(categoryTitle)}`)
        },
        [router]
    )

    const handleRenameProject = useCallback((projectId: string, newTitle: string) => {
        const updatedAt = new Date().toISOString()
        setNewProjects((prev) =>
            prev.map((p) => (String(p.id) === projectId ? { ...p, title: newTitle, updatedAt } : p))
        )
        setProjects((prev) =>
            prev.map((p) => (String(p.id) === projectId ? { ...p, title: newTitle, updatedAt } : p))
        )
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowContent(true)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    if (isLoading) {
        return <FullpageLoader duration={2000} />
    }

    return (
        <div className="min-h-screen bg-[#191919] flex flex-col">
            <Toaster
                position="bottom-center"
                toastOptions={{
                    style: {
                        background: "#1A1A1A",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        color: "#fff",
                        borderRadius: "12px",
                    },
                }}
            />

            <div
                className="transition-all duration-700 ease-out"
                style={{
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
                }}
            >
                <main ref={mainRef} className="flex-1 p-4 pt-12 sm:p-6 sm:pt-14 md:p-8 md:pt-16">
                    <div className="mx-auto w-full max-w-[288px] sm:max-w-[600px] lg:max-w-[912px]">
                        <div className="flex items-center justify-between h-12 mb-6">
                            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">Category</h1>
                        </div>

                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            
                            {allProjects.map((project, idx) => {
                                return (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: Math.min(idx * 0.03, 0.3),
                                            ease: [0.32, 0.72, 0, 1],
                                            layout: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
                                        }}
                                    >
                                        <ProjectFolder
                                            project={project}
                                            index={idx}
                                            onRemove={() => handleRemoveFolder(String(project.id))}
                                            onCancel={() => handleRemoveFolder(String(project.id))}
                                            onClick={() => handleFolderClick(project.title)}
                                            onRename={(newTitle) => handleRenameProject(String(project.id), newTitle)}
                                        />
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </main>
            </div>
            {includeFooter && <Footer />}
        </div>
    )
}
