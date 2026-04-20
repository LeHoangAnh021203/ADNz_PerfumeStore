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
                >
                  Brand
                  <br />
                  Designer
                  <br />
                  at ADNz?
                </h1>
                <div
                  className={`${inter.className} flex flex-col gap-12 text-white/50 text-sm font-light max-w-[300px]`}
                  style={{ fontSize: `${0.875 * textSize}rem` }}
                >
                  <div className="space-y-6">
                    <div className="h-px bg-white/10 w-full" />
                    <p>
                      We are looking to hire a multi-disciplinary Product & Brand Designer to develop and maintain the brand identity across our web and mobile applications, while effectively communicating the product’s value and story to users.
                    </p>
                    <p>
                      Working closely with product managers, engineers, and research teams, you will leverage user insights and data to shape a consistent and engaging brand experience across product interfaces, marketing website, in-app interactions, and future digital touchpoints.
                    </p>
                    <p>You will combine skills in UI/UX design, interaction design, visual design, and motion design to create intuitive, user-centered experiences. From designing scalable design systems to crafting seamless user journeys, your work will ensure both functional excellence and strong brand consistency across all platforms.</p>
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
                Ask For Support
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
