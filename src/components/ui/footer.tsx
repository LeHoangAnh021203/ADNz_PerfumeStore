"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#050505]">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 md:px-12">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">The Future of ADNz</p>
            <h3 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Authentic Perfume.</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/40">
              🧬 Neatly wrapped/gift box set with name engraved.
              <br />
              🧬 Ready for HN-SG-CT express.
              <br />
              🧬 FREESHIP from 50ml⬆️
              <br />
              🧬 Recruit collaborators and partners.
              <br />
              🧬 Providing wholesale/retail of high-end perfume lines.
              <br />
              🆘 Hotline: <Link href="tel:+84342988398" className="text-white">0342 988 398 (Zalo)</Link>
            </p>
            <Link
              href="/ListProduct"
              className="mt-8 inline-flex rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Order Now
            </Link>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm text-white/40">Ship worldwide</p>
            <p className="mt-1 text-2xl font-semibold text-white">Since 2024</p>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3  px-4 py-3 text-sm text-white/70">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991231.png" alt="Google Maps icon" className="h-4 w-4 shrink-0" />
                <span>Branch 01: 120 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội.</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-white/70">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991231.png" alt="Google Maps icon" className="h-4 w-4 shrink-0" />
                <span>Branch 02: 57 Trần Đăng Ninh, Cầu Giấy, Hà Nội.</span>
              </div>
              <div className="flex items-center gap-3  px-4 py-3 text-sm text-white/70">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991231.png" alt="Google Maps icon" className="h-4 w-4 shrink-0" />
                <span>Branch 03: Đường số 59, An Hội Tây, Hồ Chí Minh.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-white/30">
          <span>© 2024 ADNz Perfume</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white/60">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white/60">
              Terms
            </Link>
            <Link href="/contact" className="transition-colors hover:text-white/60">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
