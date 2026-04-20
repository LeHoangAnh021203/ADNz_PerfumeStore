import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ChatWidget } from "@/components/chat/chat-widget"
import { Toaster } from "@/components/ui/toaster"
import { WebsiteVisitTracker } from "@/components/website-visit-tracker"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "ADNz Perfume",
  description:
    "Your scent, your identity.",
  generator: "Le Hoang Anh",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <WebsiteVisitTracker />
          {children}
          <Toaster />
          <ChatWidget />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
