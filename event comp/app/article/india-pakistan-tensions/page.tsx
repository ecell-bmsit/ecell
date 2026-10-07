"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { sora, georgiaPro, urbanist } from "../../fonts"
import { ArrowLeft, Bookmark, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import WeatherWidget from "@/components/WeatherWidget"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import Image from "next/image"
import TimeAgo from "@/components/TimeAgo"
import SocialShareButtons from "@/components/SocialShareButtons"
import CommentSection from "@/components/CommentSection"
import { Separator } from "@/components/ui/separator"

export default function IndiaPakistanTensionsArticle() {
  const router = useRouter()
  const [currentDateTime, setCurrentDateTime] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [userTimezone, setUserTimezone] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const articleId = "india-pakistan-tensions"

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Detect user's timezone
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTimezone(timezone || "")
    } catch (error) {
      console.error("Error detecting timezone:", error)
    }

    // Update date and time every second
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

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    // Check if article is bookmarked
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")
    setIsBookmarked(bookmarks.includes(articleId))

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearInterval(interval)
    }
  }, [userTimezone, articleId])

  // Function to calculate relative time
  const getRelativeTime = (minutesAgo: number): string => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000)
    return timestamp.toISOString()
  }

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")

    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((id: string) => id !== articleId)
      localStorage.setItem("bookmarkedArticles", JSON.stringify(updatedBookmarks))
    } else {
      bookmarks.push(articleId)
      localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarks))
    }

    setIsBookmarked(!isBookmarked)
  }

  // Prepare metadata for SEO
  const pageTitle = "Escalating Tensions: India Accuses Pakistan of Missile Attack | The Fast and Real News"
  const pageDescription =
    "India has accused Pakistan of attempting a pre-emptive strike using a high-speed missile targeting critical Indian military infrastructure."
  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "https://the-fast-and-real-news.vercel.app/article/india-pakistan-tensions"
  const pageImage = "/placeholder.svg?height=600&width=1200"
  const tags = ["india", "pakistan", "military", "missile", "conflict", "defense", "international"]

  useEffect(() => {
    // Any code that needs to access window or browser APIs
  }, [])

  return (
    <>
      {/* SEO Metadata */}

      <div className={`min-h-screen bg-[#141414] ${georgiaPro.variable} ${urbanist.variable}`}>
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Breaking News Banner */}
          <BreakingNewsBar />

          {/* Header with back button and date */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 mb-4 md:mb-0"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
            <div className="text-white/70 text-sm">
              {currentDateTime}
              {userTimezone && <div className="text-xs text-white/50 mt-1">{userTimezone}</div>}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-3/4">
              {/* Article Header */}
              <div className="mb-8 md:mb-12">
                <div className="flex flex-wrap items-center gap-2 text-white/60 text-sm mb-4">
                  <span className="bg-red-900/80 px-3 py-1 rounded-full flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Breaking News
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />8 min read
                  </span>
                </div>

                <h1
                  className={`${sora.className} text-3xl md:text-5xl lg:text-6xl font-light italic text-white/90 tracking-tighter leading-[1.2] mb-6`}
                >
                  Escalating Tensions: India Accuses Pakistan of Missile Attack and Launches Retaliation
                </h1>

                <p className="text-white/70 text-lg md:text-xl mb-6">
                  India has accused Pakistan of attempting a pre-emptive strike using a high-speed missile targeting
                  critical Indian military infrastructure.
                </p>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="text-white/60 text-sm">
                    By Rajiv Kumar • <TimeAgo date={getRelativeTime(15)} updateInterval={10000} />
                  </div>
                  <div className="flex space-x-2">
                    {typeof window !== "undefined" && (
                      <SocialShareButtons
                        url={pageUrl}
                        title="Escalating Tensions: India Accuses Pakistan of Missile Attack"
                        summary="India has accused Pakistan of attempting a pre-emptive strike using a high-speed missile targeting critical Indian military infrastructure."
                        hashtags={tags}
                        variant="minimal"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`text-white/60 hover:text-white hover:bg-white/10 ${isBookmarked ? "text-yellow-400" : ""}`}
                      onClick={toggleBookmark}
                    >
                      <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="w-full aspect-video mb-8 md:mb-12 rounded-lg overflow-hidden relative">
                <Image
                  src="/placeholder.svg?height=600&width=1200"
                  alt="India-Pakistan Tensions"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 75vw"
                  priority
                />
              </div>

              {/* Article Content */}
              <div
                className={`${urbanist.className} text-white/80 text-base md:text-lg leading-relaxed space-y-6 mb-12 md:mb-16`}
              >
                <p>
                  <strong>New Delhi, India</strong> – Tensions between neighboring nuclear powers India and Pakistan
                  have sharply escalated following a high-stakes press briefing by the Indian Ministry of External
                  Affairs and Ministry of Defence. India has publicly accused Pakistan of attempting a pre-emptive
                  strike using a high-speed missile targeting critical Indian military infrastructure.
                </p>

                <p>
                  According to revelations from the briefing, a high-speed missile, potentially a Babur Cruise missile,
                  Ababeel, or Ra'ad II, was launched from Pakistan with the clear intent of striking Indian military
                  installations. The primary targets were identified as the strategically vital Indian Air Force bases
                  in Pathankot and Adampur, located in Punjab. Pathankot is a significant base housing advanced aircraft
                  like MiG 29s, Sukhoi 30 MKIs, and Apache helicopters, while Adampur is the second-largest airbase in
                  the Western sector.
                </p>

                <p>
                  The Indian government swiftly condemned the act as a provocative and escalatory move. India confirmed
                  that its defense systems successfully thwarted the incoming missile. In a decisive response, India
                  initiated retaliatory strikes against Pakistani military installations. These strikes reportedly
                  targeted Pakistani radar sites and forward logistic depots. India claims to have struck four Pakistani
                  airbases: Noor Khan Airbase near Rawalpindi, Murid Airbase, Rafiqui Airbase, and an airbase near
                  Karachi. While India reported no major damage on its side, the briefing indicated that the Noor Khan
                  Airbase in Pakistan sustained significant damage.
                </p>

                {/* YouTube Video Embed */}
                <div className="relative w-full aspect-video my-8">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/73O4GlzKqsA?si=t3YGtRZSQ6lh08sQ"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>

                <p>
                  Amidst the military actions, an intense information warfare campaign is reportedly underway. India
                  alleges that Pakistan is disseminating false casualty reports and exaggerating the impact of the
                  situation on civilians and military personnel to gain international sympathy. Pakistani news channels
                  and social media are accused of falsely claiming the destruction of Indian airbases, such as the Sirsa
                  Airbase, claims that were directly refuted with presented evidence during the Indian press briefing.
                  Additionally, there are concerns that the Pakistani government is using civilian flights as human
                  shields.
                </p>

                <p>
                  Adding to the volatility, there are reports of significant Pakistani military troop movements towards
                  forward areas along the Line of Control (LOC) and the International Border in areas including Jammu,
                  Punjab, and Rajouri-Poonch. High-resolution satellite imagery and drone surveillance are being
                  employed by India to track these deployments. Pakistan is also reportedly mobilizing artillery and
                  missile units, including surface-to-surface missile batteries and air defense systems, to the front
                  lines. Indian officials assess these movements as an attempt by Pakistan to provoke a conventional
                  war, potentially influenced by Pakistan's economic struggles. India stated it is strategically
                  monitoring the situation closely.
                </p>

                <p>
                  The situation remains fluid and highly tense, with both nations engaged in a dangerous exchange of
                  military actions. International diplomatic efforts are underway to de-escalate the situation, with
                  several countries calling for restraint from both sides. The United Nations Security Council is
                  expected to convene an emergency session to address the rapidly deteriorating situation between the
                  two nuclear-armed neighbors.
                </p>

                <p>The Fast and Real News will continue to provide updates as this critical situation develops.</p>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <h3 className="text-white/70 text-sm mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-white/20"
                      onClick={() => router.push(`/tag/${tag}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {typeof window !== "undefined" && (
                <div className="mb-12">
                  <h3 className="text-white/70 text-sm mb-4">Share this article:</h3>
                  <SocialShareButtons
                    url={pageUrl}
                    title="Escalating Tensions: India Accuses Pakistan of Missile Attack"
                    summary="India has accused Pakistan of attempting a pre-emptive strike using a high-speed missile targeting critical Indian military infrastructure."
                    hashtags={tags}
                    size="sm"
                  />
                </div>
              )}

              <Separator className="bg-white/10 my-8" />

              {/* Comment Section */}
              <CommentSection articleId={articleId} />

              <Separator className="bg-white/10 my-8" />

              {/* Related Articles */}
              <div className="border-t border-white/10 pt-8 md:pt-12">
                <h2
                  className={`${georgiaPro.className} text-2xl md:text-3xl font-light italic text-white/80 tracking-tighter mb-6 md:mb-8`}
                >
                  Related Articles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div
                    className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => router.push(`/article/2`)}
                  >
                    <div className="aspect-video relative">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="UN Security Council"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-white/60 text-xs mb-2">
                        International • <TimeAgo date={getRelativeTime(120)} updateInterval={60000} />
                      </div>
                      <h3 className="text-white font-bold mb-2">
                        UN Security Council Calls Emergency Meeting on India-Pakistan Crisis
                      </h3>
                      <p className="text-white/70 text-sm line-clamp-2">
                        The United Nations Security Council has called an emergency session to address the escalating
                        military tensions between India and Pakistan.
                      </p>
                    </div>
                  </div>

                  <div
                    className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => router.push(`/article/3`)}
                  >
                    <div className="aspect-video relative">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="India's Missile Defense Systems"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-white/60 text-xs mb-2">
                        Defense • <TimeAgo date={getRelativeTime(180)} updateInterval={60000} />
                      </div>
                      <h3 className="text-white font-bold mb-2">
                        Analysis: India's Missile Defense Systems Under Spotlight
                      </h3>
                      <p className="text-white/70 text-sm line-clamp-2">
                        Military experts evaluate the effectiveness of India's missile defense systems following the
                        recent interception of Pakistani missiles.
                      </p>
                    </div>
                  </div>

                  <div
                    className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => router.push(`/article/4`)}
                  >
                    <div className="aspect-video relative">
                      <Image
                        src="/placeholder.svg?height=300&width=500"
                        alt="Markets React"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-white/60 text-xs mb-2">
                        Economy • <TimeAgo date={getRelativeTime(240)} updateInterval={60000} />
                      </div>
                      <h3 className="text-white font-bold mb-2">Markets React to India-Pakistan Military Exchange</h3>
                      <p className="text-white/70 text-sm line-clamp-2">
                        Stock markets in both countries plummet as military tensions escalate, with global investors
                        expressing concern over regional stability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/4 mt-8 lg:mt-0">
              <div className="sticky top-4">
                <WeatherWidget />

                <div className="mt-6 bg-white/5 rounded-lg p-4">
                  <h3
                    className={`${georgiaPro.className} text-xl font-light italic text-white/80 mb-4`}
                  >
                    Latest Updates
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b border-white/10 pb-4">
                      <div className="text-white/60 text-xs mb-1">
                        <TimeAgo date={getRelativeTime(30)} updateInterval={60000} />
                      </div>
                      <h4 className="text-white font-medium text-sm">
                        Pakistan Denies Missile Launch, Claims Indian Aggression
                      </h4>
                    </div>
                    <div className="border-b border-white/10 pb-4">
                      <div className="text-white/60 text-xs mb-1">
                        <TimeAgo date={getRelativeTime(45)} updateInterval={60000} />
                      </div>
                      <h4 className="text-white font-medium text-sm">Indian PM Calls Emergency Security Meeting</h4>
                    </div>
                    <div className="border-b border-white/10 pb-4">
                      <div className="text-white/60 text-xs mb-1">
                        <TimeAgo date={getRelativeTime(60)} updateInterval={60000} />
                      </div>
                      <h4 className="text-white font-medium text-sm">
                        US Urges Restraint, Offers Diplomatic Assistance
                      </h4>
                    </div>
                    <div className="border-b border-white/10 pb-4">
                      <div className="text-white/60 text-xs mb-1">
                        <TimeAgo date={getRelativeTime(75)} updateInterval={60000} />
                      </div>
                      <h4 className="text-white font-medium text-sm">
                        Indian Air Force on High Alert Across Western Border
                      </h4>
                    </div>
                    <div className="pb-4">
                      <div className="text-white/60 text-xs mb-1">
                        <TimeAgo date={getRelativeTime(90)} updateInterval={60000} />
                      </div>
                      <h4 className="text-white font-medium text-sm">
                        Satellite Images Show Damage to Pakistani Airbase
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
