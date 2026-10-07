"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DynamicFrameLayout from "../components/DynamicFrameLayout"
import { sora, georgiaPro, urbanist } from "./fonts"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import WeatherWidget from "@/components/WeatherWidget"
import BreakingNewsBar from "@/components/BreakingNewsBar"

export default function Home() {
  const [headerSize] = useState(1.2) // 120% is the default size
  const [textSize] = useState(0.8) // 80% is the default size
  const [currentDateTime, setCurrentDateTime] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [userTimezone, setUserTimezone] = useState("")

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Detect user's timezone
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTimezone(timezone || "")
    } catch (error) {
      console.error("Error detecting timezone:", error)
    }
  }, [])

  // Update the date and time display in the Home component
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: userTimezone || undefined,
      }
      setCurrentDateTime(now.toLocaleDateString(undefined, options))
    }

    updateDateTime() // Initial update
    const interval = setInterval(updateDateTime, 1000) // Update every second for more accuracy

    return () => clearInterval(interval)
  }, [userTimezone])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // In a real implementation, this would filter articles or redirect to search results
  }

  return (
    <div
      className={`min-h-screen bg-[#141414] p-4 md:p-8 ${georgiaPro.variable} ${urbanist.variable}`}
    >
      {/* Breaking News Banner - Always at the top */}
      <BreakingNewsBar />

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Content */}
        <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-6">
          <h1
            className={`${sora.className} text-4xl md:text-5xl lg:text-6xl font-light italic text-white/80 tracking-tighter leading-[130%]`}
            style={{ fontSize: `${(isMobile ? 3 : 4) * headerSize}rem` }}
          >
            {isMobile ? "TFARN" : "The Fast\nand Real\nNews"}
          </h1>

          {/* Dynamic Date and Time */}
          <div className="text-white/70 text-sm font-light">
            {currentDateTime}
            {userTimezone && <div className="text-xs text-white/50 mt-1">{userTimezone}</div>}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-8 bg-white/5 border-white/10 text-white/80 placeholder:text-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="border-white/10 text-white/80 hover:bg-white/5">
              Search
            </Button>
          </form>

          {/* Weather Widget - Only visible on desktop or at top on mobile */}
          <div className={`${isMobile ? "order-first mb-4" : ""}`}>
            <WeatherWidget />
          </div>

          <div
            className={`${urbanist.className} flex flex-col gap-6 text-white/50 text-sm font-light max-w-[300px]`}
            style={{ fontSize: `${0.875 * textSize}rem` }}
          >
            <div className="space-y-6">
              <div className="h-px bg-white/10 w-full" />
              <p>
                "The Fast and Real News" (TFARN) is a dynamic digital newspaper committed to delivering accurate,
                unbiased, and rapid news coverage across the Indian subcontinent. From breaking political developments
                and economic updates to culture, science, and grassroots stories, TFARN ensures that readers stay
                informed with facts — not noise. With a focus on speed without sacrificing truth, TFARN is your reliable
                window into the realities shaping South Asia.
              </p>
              <div className="h-px bg-white/10 w-full" />
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full lg:flex-grow h-[60vh] md:h-[70vh] lg:h-[80vh]">
          <DynamicFrameLayout />
        </div>
      </div>
    </div>
  )
}
