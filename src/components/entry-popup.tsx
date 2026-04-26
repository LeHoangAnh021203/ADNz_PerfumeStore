"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export function EntryPopup() {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-[#0b0b0b] shadow-2xl">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src="/events/sk.png"
            alt="Thông báo sự kiện"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "https://business.facebook.com/latest/inbox"
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Detail
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
