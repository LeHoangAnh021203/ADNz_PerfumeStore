"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  normalizeAndValidateEmail,
  normalizeAndValidateLinks,
  normalizeAndValidatePhone,
} from "@/lib/wholesale-validation"

type SubmitState = "idle" | "submitting" | "success" | "error"

export function Header() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [submitMessage, setSubmitMessage] = useState("")
  const [zaloPhone, setZaloPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [pageLinks, setPageLinks] = useState([""])

  const updatePageLink = (index: number, value: string) => {
    setPageLinks((current) =>
      current.map((link, linkIndex) => (linkIndex === index ? value : link))
    )
  }

  const addPageLink = () => {
    setPageLinks((current) => [...current, ""])
  }

  const removePageLink = (index: number) => {
    setPageLinks((current) =>
      current.length === 1
        ? [""]
        : current.filter((_, linkIndex) => linkIndex !== index)
    )
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSubmitState("idle")
    setSubmitMessage("")
    setZaloPhone("")
    setCustomerEmail("")
    setPageLinks([""])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const phoneResult = normalizeAndValidatePhone(zaloPhone)
    if (!phoneResult.ok) {
      setSubmitState("error")
      setSubmitMessage(phoneResult.error)
      return
    }

    const emailResult = normalizeAndValidateEmail(customerEmail)
    if (!emailResult.ok) {
      setSubmitState("error")
      setSubmitMessage(emailResult.error)
      return
    }

    const linksResult = normalizeAndValidateLinks(pageLinks)
    if (!linksResult.ok) {
      setSubmitState("error")
      setSubmitMessage(linksResult.errors[0] || "Link chưa đúng định dạng.")
      return
    }

    setSubmitState("submitting")
    setSubmitMessage("")

    try {
      const response = await fetch("/api/wholesale-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zaloPhone: phoneResult.local,
          customerEmail: emailResult.value,
          pageLinks: linksResult.links.map((link) => link.normalizedUrl),
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        message?: string
      }

      if (!response.ok || !payload.ok) {
        setSubmitState("error")
        setSubmitMessage(payload.message || "Đăng ký chưa thành công. Vui lòng thử lại.")
        return
      }

      setSubmitState("success")
      setSubmitMessage(payload.message || "Đăng ký thành công.")
    } catch {
      setSubmitState("error")
      setSubmitMessage("Mất kết nối tới máy chủ. Vui lòng thử lại sau ít phút.")
    }
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[80] flex items-center justify-between px-4 py-4 md:px-10">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-70">
        ADNz Perfume
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <Link href="/ListProduct" className="text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white">
          Products
          </Link>
          <Link href="/Map" className="text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white">
          Customer
          </Link>
          <Link href="/about-us" className="text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white">
          About
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="rounded-full border border-white/20 bg-transparent px-3 py-2 text-[11px] font-medium text-white transition-all hover:bg-white hover:text-black md:px-5 md:text-xs"
        >
          Wholesale & Reseller
        </button>
      </header>
      <nav className="fixed left-1/2 top-[68px] z-[80] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2 py-1 backdrop-blur md:hidden">
        <Link
          href="/ListProduct"
          className="rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-white/75 transition-colors hover:text-white"
        >
          Products
        </Link>
        <Link
          href="/Map"
          className="rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-white/75 transition-colors hover:text-white"
        >
          Customer
        </Link>
        <Link
          href="/about-us"
          className="rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-white/75 transition-colors hover:text-white"
        >
          About
        </Link>
      </nav>

      {isFormOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-24 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#111111] p-6 text-white shadow-2xl">
            {submitState === "success" || submitState === "error" ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex items-center justify-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15 bg-white/5">
                    <Image
                      src="/logo/logo.jpg"
                      alt="ADNz Perfume"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">
                    {submitState === "success" ? "Đăng ký đã được ghi nhận" : "Không thể gửi đăng ký"}
                  </h2>
                  <p className="text-sm leading-7 text-white/70">
                    {submitMessage ||
                      (submitState === "success"
                        ? "Vui lòng chờ xét duyệt. ADNz sẽ liên lạc với bạn trong thời gian sớm nhất."
                        : "Vui lòng kiểm tra lại thông tin và thử lại.")}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {submitState === "error" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitState("idle")
                        setSubmitMessage("")
                      }}
                      className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                    >
                      Thử lại
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Đăng ký CTV / Lấy sỉ</h2>
                  <p className="text-sm text-white/65">
                    Điền thông tin bên dưới để ADNz xét duyệt hồ sơ hợp tác.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="zalo-phone" className="text-sm font-medium text-white/85">
                    Số điện thoại Zalo
                  </label>
                  <input
                    id="zalo-phone"
                    type="tel"
                    value={zaloPhone}
                    onChange={(event) => setZaloPhone(event.target.value)}
                    placeholder="Nhập số điện thoại Zalo"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/25"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="customer-email" className="text-sm font-medium text-white/85">
                    Email liên hệ
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/25"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-white/85">
                      Page bán hàng (nếu có)
                    </label>
                    <button
                      type="button"
                      onClick={addPageLink}
                      className="text-sm font-medium text-white/70 transition hover:text-white"
                    >
                      + Thêm link
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pageLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="url"
                          value={link}
                          onChange={(event) => updatePageLink(index, event.target.value)}
                          placeholder="facebook.com/..., instagram.com/..., tiktok.com/..."
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/25"
                        />
                        <button
                          type="button"
                          onClick={() => removePageLink(index)}
                          className="rounded-full border border-white/10 px-4 py-3 text-xs font-medium text-white/70 transition hover:border-white/25 hover:text-white"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90"
                  >
                    {submitState === "submitting" ? "Đang gửi..." : "Gửi đăng ký"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
