import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"

const branches = [
  "Branch 01: 120 Cau Giay, Dich Vong, Cau Giay, Ha Noi",
  "Branch 02: 57 Tran Dang Ninh, Cau Giay, Ha Noi",
  "Branch 03: Duong so 59, An Hoi Tay, Ho Chi Minh City",
  "Branch 04: ...",
]

const socialChannels = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61573770329166", color: "#1877F2" },
  { label: "Instagram", href: "https://www.instagram.com/adnz.perfume?fbclid=IwY2xjawRdOPNleHRuA2FlbQIxMABicmlkETFEZFNRWjM0MGltaTVUakpyc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHqWv_yQXzZm_bgGD9Z8cKoT8LHQX_7vHpoVSvcF6mwrejpQYelrxUY7rQ9sS_aem_Tk4I1VcqlT0xrmOo_1IUBQ", color: "#E4405F" },
  { label: "TikTok", href: "https://www.tiktok.com/@adnz_perfume?fbclid=IwY2xjawRdOSBleHRuA2FlbQIxMABicmlkETFEZFNRWjM0MGltaTVUakpyc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHqWv_yQXzZm_bgGD9Z8cKoT8LHQX_7vHpoVSvcF6mwrejpQYelrxUY7rQ9sS_aem_Tk4I1VcqlT0xrmOo_1IUBQ", color: "#25F4EE" },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#111214] text-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">Support</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Contact</h1>
            <p className="mt-3 text-sm text-white/60 sm:text-base">We are ready to support retail, wholesale, and reseller customers.</p>
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
            <h2 className="mb-2 text-lg font-medium text-white">Hotline / Zalo</h2>
            <p>
              <a href="tel:+84342988398" className="text-white underline underline-offset-4">
                0342 988 398
              </a>
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-medium text-white">Email</h2>
            <p>adnz.perfume@gmail.com</p>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-medium text-white">Social Channels</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {socialChannels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border px-4 py-3 text-white/80 transition hover:text-white"
                  style={{ borderColor: `${channel.color}80` }}
                >
                  {channel.label}
                </a>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-medium text-white">Branches</h2>
            <div className="flex flex-col gap-3">
              {branches.map((branch) => (
                <div key={branch} className="rounded-xl border border-white/10 px-4 py-3 text-white/70">
                  {branch}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
