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
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-16 md:pt-16">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">
              Category Config
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl md:mt-3">
              Tester / Refill / Showcase
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Trang nay de ban dinh nghia cac loai mat hang dac biet.
            </p>
          </div>
          <Link
            href="/#category"
            className="w-fit rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Back to Category
          </Link>
        </div>

        <div className="rounded-3xl bg-black/95 px-3 py-5 sm:px-5 sm:py-7 md:px-8 md:py-10">
          <main className="pb-2 pt-2 sm:pb-4 sm:pt-4 md:pb-6 md:pt-6">
            <WorksGallery />
          </main>
        </div>
      </main>
      <Footer />
    </div>
  )
}
