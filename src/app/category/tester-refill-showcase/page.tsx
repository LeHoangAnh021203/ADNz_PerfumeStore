import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { WorksGallery } from "@/components/works-gallery"

const itemTypes = [
  {
    key: "tester",
    title: "Tester",
    description: "Khai bao cac san pham tester, dung tich, gia va ghi chu.",
  },
  {
    key: "refill",
    title: "Refill",
    description: "Dinh nghia cac bien the refill theo dung tich va thuong hieu.",
  },
  {
    key: "showcase",
    title: "Showcase",
    description: "Quan ly cac mat hang trung bay/showcase va trang thai ton.",
  },
]

export default function TesterRefillShowcasePage() {
  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">
              Category Config
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Tester / Refill / Showcase
            </h1>
            <p className="mt-3 text-white/60">
              Trang nay de ban dinh nghia cac loai mat hang dac biet.
            </p>
          </div>
          <Link
            href="/#category"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Back to Category
          </Link>
        </div>

        <div className="min-h-screen bg-black">
          {/* Header */}


          {/* Works Gallery */}
          <main className="pt-32 pb-16">
            <WorksGallery />
          </main>
        </div>
      </main>
      <Footer />
    </div>
  )
}
