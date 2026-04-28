import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">Policy</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-white/60 sm:text-base">Effective date: April 28, 2026</p>
          </div>
          <Link
            href="/"
            className="w-fit rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Back Home
          </Link>
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-[#141414] p-6 text-sm leading-relaxed text-white/75 md:p-8">
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">1. Product Commitment</h2>
            <p>ADNz Perfume commits to providing authentic perfume products as described in each listing.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">2. Orders and Confirmation</h2>
            <p>Orders are considered confirmed after customer verification through our support channels and stock availability check.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">3. Pricing and Payment</h2>
            <p>Prices are displayed per product and may change without prior notice. Final price is confirmed at checkout or order confirmation.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">4. Shipping and Delivery</h2>
            <p>We support domestic and international shipping where available. Delivery timelines depend on location and shipping carrier performance.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">5. Return and Exchange</h2>
            <p>Return or exchange requests are reviewed case-by-case for damaged, incorrect, or defective products, with proof required upon receipt.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">6. Contact</h2>
            <p>For support regarding these terms, contact ADNz Perfume via hotline/Zalo: 0342 988 398.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
