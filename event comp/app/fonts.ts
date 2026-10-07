import localFont from "next/font/local"

export const sora = localFont({
  src: "../public/main_fonts/main-fonts/Sora/Sora-VariableFont_wght.ttf",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-heading",
})

export const georgiaPro = localFont({
  src: [
    { path: "../public/main_fonts/main-fonts/Georgia-Pro/GeorgiaPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/main_fonts/main-fonts/Georgia-Pro/GeorgiaPro-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/main_fonts/main-fonts/Georgia-Pro/GeorgiaPro-Semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/main_fonts/main-fonts/Georgia-Pro/GeorgiaPro-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-subheading",
})

export const urbanist = localFont({
  src: "../public/main_fonts/main-fonts/Urbanist/Urbanist-VariableFont_wght.ttf",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-body",
})
