"use client"

import { useState } from "react"
import DynamicFrameLayout from "@/components/software support/DynamicFrameLayout"
import { ppEditorialNewUltralightItalic, inter } from "./fonts"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

export default function SoftwareSupport() {
  const [headerSize] = useState(1.2) // 120% is the default size
  const [textSize] = useState(0.8) // 80% is the default size

  return (
    <div className={`min-h-screen bg-[#111214] text-white ${ppEditorialNewUltralightItalic.variable} ${inter.variable}`}>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Software Support</h1>

          </div>
          <Link
            href="/#category"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Back to Category
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#141414] p-6 md:p-8">
          <div className="w-full h-full flex flex-col md:flex-row items-start gap-8 md:gap-8">
            {/* Left Content */}
            <div className="w-full md:w-[260px] flex-shrink-0 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-16">
                <h1
                  className={`${ppEditorialNewUltralightItalic.className} text-4xl md:text-6xl font-light italic text-white/80 tracking-tighter leading-[130%]`}
                  style={{ fontSize: `${3 * headerSize}rem` }}
                >Business
                  <br />
                  Setup
                  <br />
                  Support
                </h1>
                <div
                  className={`${inter.className} flex flex-col gap-12 text-white/50 text-sm font-light max-w-[300px]`}
                  style={{ fontSize: `${0.875 * textSize}rem` }}
                >
                  <div className="space-y-6">
                    <div className="h-px bg-white/10 w-full" />
                    <p>
                      Our first priority is helping you establish your business with confidence, including company documents, legal procedures, and tax setup.
                    </p>
                    <p>
                      We then design your brand and build the digital foundation: website, mobile app, and management software tailored to your operations.
                    </p>
                    <p>
                      Finally, we run performance advertising campaigns to help you reach the right audience, generate qualified leads, and scale revenue sustainably.
                    </p>
                    <div className="h-px bg-white/10 w-full" />
                  </div>
                </div>

              </div>
              <a
                href="https://zalo.me/0342988398"
                className="inline-block px-6 py-3 text-white/70 border border-white/20 rounded-full font-medium hover:bg-white/5 transition-colors text-center w-full max-w-[260px] text-sm mt-5"
                target="_blank"
                rel="noopener noreferrer"
              >
                Request Support
              </a>
            </div>

            {/* Right Content */}
            <div className="w-full md:flex-grow h-[60vh] md:h-[80vh]">
              <DynamicFrameLayout />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
