import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { FeaturesSection } from "@/components/ui/features-section"
import { TestimonialsSection } from "@/components/ui/testimonials-section"
import { FAQSection } from "@/components/ui/faq-section"
import { LoopingVideoBanner } from "@/components/ui/looping-video-banner"
import OptionsSelector from "../../components/options-selector"
const socialCards = [
    {
        platform: "Facebook",
        handle: "ADNz_Perfume",
        description: "Khám phá bộ sưu tập nước hoa cao cấp, được tuyển chọn kỹ lưỡng và bảo chứng chất lượng.",
        accent: "from-sky-400/20 to-blue-500/10",
    },
    {
        platform: "Zalo",
        handle: "ADNz - Sỉ",
        description: "Giá cạnh tranh, nguồn hàng đa dạng. Sẵn các mã đang trend thị trường: fullseal, mini, set.",
        accent: "from-cyan-300/20 to-sky-500/10",
    },
    {
        platform: "Instagram",
        handle: "ADNz_Perfume",
        description: "Lựa chọn nước hoa chính hãng với những mẫu mã ấn tượng. Bao bì đẹp, đảm bảo bạn sẽ hài lòng.",
        accent: "from-amber-300/20 to-rose-400/15",
    },
    {
        platform: "TikTok",
        handle: "ADNz_Perfume",
        description: "Cung cấp video và hình ảnh về quá trình khui seal, chiết nước hoa và cập nhật sản phẩm mới.",
        accent: "from-fuchsia-300/15 to-cyan-300/15",
    },
]

export default function AboutUsPage() {
    return (
        <main className="min-h-screen bg-[#05060f] text-white">
            <Header />
            <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-24 md:px-6">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e1230] via-[#0a0d20] to-[#05070f] p-5 md:p-7">
                    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">ADNz Perfume</p>
                            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">LE HOANG ANH</h1>
                            <p className="text-sm uppercase tracking-[0.25em] text-white/60">Founder</p>
                        </div>
                        <div className="space-y-2 text-sm text-white/85">
                            <p>🧬 Nước hoa chính hãng (Authentic Perfume).</p>
                            <p>🧬 Set gói/hộp quà chỉn chu có khắc tên.</p>
                            <p>🧬 Sẵn hoả tốc HN-SG, FREESHIP từ 50ml⬆️</p>
                            <p>🧬 Tuyển CTV và khách sỉ số lượng lớn.</p>
                            <p>🧬 Cung cấp sỉ/lẻ các dòng nước hoa cao cấp.</p>
                            <p>🆘 Hotline: 0342 988 398</p>
                        </div>
                    </div>
                </div>

                <OptionsSelector />


                <FeaturesSection />

                <TestimonialsSection />

                <FAQSection />

                <div className="overflow-hidden rounded-[500%] border border-white/10 ">
                    <LoopingVideoBanner
                        src="/video/video.mp4"
                        className="aspect-video w-full object-cover object-[center_34%] "
                    />
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">By ADNz_Perfume</p>
            </section>
            <Footer />
        </main>
    )
}
