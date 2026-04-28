import { ArtGallerySlider } from "@/components/art-gallery-slider"
import HeadphoneScroll from "@/components/headphone-scroll"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import ClipsPage from "./category/page"
import EntryPopup from "@/components/entry-popup"

export default function Home() {
  return (
    <main className="relative bg-[#050505]">
      <EntryPopup />
      {/* Navigation */}
      <Header />

      {/* Scrollytelling Section */}
      <HeadphoneScroll />

      <section className="relative z-10 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-12 md:py-32">
          <div className="mb-8 md:mb-20">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
            </h2>
          </div>
          <div className="h-[560px] w-full overflow-hidden rounded-2xl bg-black md:h-[700px] md:rounded-3xl">
            <ArtGallerySlider />
          </div>

        </div>
        <div id="category">
          <ClipsPage includeFooter={false} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
