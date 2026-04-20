"use client"

import type { ReactNode } from "react"
import { GenerationProvider } from "@/contexts/generation-context"

export function Providers({ children }: { children: ReactNode }) {
  return <GenerationProvider>{children}</GenerationProvider>
}

