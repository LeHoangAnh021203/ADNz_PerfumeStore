"use client"

import { useState } from "react"
import DynamicFrameLayout from "@/components/software support/DynamicFrameLayout"
import { ppEditorialNewUltralightItalic, inter } from "./fonts"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/ui/header"

export default function SoftwareSupport() {
  const [headerSize] = useState(1.2) // 120% is the default size
  const [textSize] = useState(0.8) // 80% is the default size

  return (
    <div className={`min-h-screen bg-[#111214] text-white ${ppEditorialNewUltralightItalic.variable} ${inter.variable}`}>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">Category Config</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Software Support</h1>
            <p className="mt-3 text-white/60">Trang nay de ban xem thong tin va chi tiet software support.</p>
          </div>
          <Link
            href="/category"
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
                  style={{ fontSize: `${4 * headerSize}rem` }}
                >
                  Brand
                  <br />
                  Designer
                  <br />
                  at Luma?
                </h1>
                <div
                  className={`${inter.className} flex flex-col gap-12 text-white/50 text-sm font-light max-w-[300px]`}
                  style={{ fontSize: `${0.875 * textSize}rem` }}
                >
                  <div className="space-y-6">
                    <div className="h-px bg-white/10 w-full" />
                    <p>
                      Luma is looking to hire a multi-disciplinary Brand Designer to develop and maintain the brand identity
                      and communicate the story of Luma to the world. Alongside members of the design team using product and
                      research insights, you will help shape and define Luma's brand across product surfaces, social media,
                      merchandise, marketing website, launch campaigns as well as other new channels.
                    </p>
                    <p>
                      You will use a combination of graphic design, motion design, web design and video production/editing
                      skills across traditional and innovative tools to communicate in visually compelling and impactful
                      ways.
                    </p>
                    <p>Here are some of our favorite works so far.</p>
                    <div className="h-px bg-white/10 w-full" />
                  </div>
                </div>
                <Link
                  href="https://zalo.me/0342988398"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 relative opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Image
                    src="https://i.pinimg.com/originals/8d/73/96/8d73967f96c637ea8fbb8277612c3904.gif"
                    alt="ADNz Logo"
                    fill
                    className="object-contain"
                  />
                </Link>
              </div>
              <a
                href="https://zalo.me/0342988398"
                className="inline-block px-6 py-3 text-white/70 border border-white/20 rounded-full font-medium hover:bg-white/5 transition-colors text-center w-full max-w-[260px] text-sm mt-16"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply
              </a>
            </div>

            {/* Right Content */}
            <div className="w-full md:flex-grow h-[60vh] md:h-[80vh]">
              <DynamicFrameLayout />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
