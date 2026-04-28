import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">Policy</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
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
            <h2 className="mb-2 text-lg font-medium text-white">1. Information We Collect</h2>
            <p>We collect basic customer information needed to process orders, provide support, and arrange shipping, such as name, phone number, delivery address, and order details.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">2. How We Use Information</h2>
            <p>Your information is used to confirm orders, deliver products, provide after-sales support, and notify you about order status or service updates.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">3. Data Sharing</h2>
            <p>We only share necessary information with shipping partners and payment-related services to complete your transaction. We do not sell personal data to third parties.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">4. Data Security</h2>
            <p>We apply reasonable operational and technical safeguards to protect customer data from unauthorized access, misuse, or disclosure.</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">5. Contact</h2>
            <p>For privacy requests, please contact ADNz Perfume via hotline/Zalo: 0342 988 398.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
