"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ChatShell } from "./chat-shell"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname === "/chat") {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="mb-3 w-[min(92vw,420px)]">
          <ChatShell variant="widget" onClose={() => setIsOpen(false)} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/85 text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur transition hover:scale-105 hover:bg-black"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 transition group-hover:rotate-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 10h8" />
          <path d="M8 14h5" />
          <path d="M21 12a8.96 8.96 0 0 1-2.64 6.36A9 9 0 0 1 12 21a8.96 8.96 0 0 1-4.22-1.05L3 21l1.05-4.78A8.96 8.96 0 0 1 3 12a9 9 0 1 1 18 0Z" />
        </svg>
      </button>
    </div>
  )
}
