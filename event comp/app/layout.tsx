import "./globals.css"
import { sora, georgiaPro, urbanist } from "./fonts"
import type React from "react"

export const metadata = {
  title: "Dynamic Frame Layout",
  description: "A dynamic frame layout with custom fonts",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} ${georgiaPro.variable} ${urbanist.variable}`}>
      <body className={urbanist.className}>{children}</body>
    </html>
  )
}
