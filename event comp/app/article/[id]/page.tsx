"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { sora, georgiaPro, urbanist } from "../../fonts"
import { ArrowLeft, Bookmark, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import WeatherWidget from "@/components/WeatherWidget"
import BreakingNewsBar from "@/components/BreakingNewsBar"
import Image from "next/image"
import TimeAgo from "@/components/TimeAgo"
import SocialShareButtons from "@/components/SocialShareButtons"
import CommentSection from "@/components/CommentSection"
import { Separator } from "@/components/ui/separator"

// Update the article data to use actual dates and placeholder images
const articles = [
  {
    id: 1,
    title: "Political Tensions Rise in Delhi as Opposition Calls for Protests",
    summary:
      "Opposition leaders have called for nationwide protests following controversial legislation passed by the ruling party.",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    author: "Priya Sharma",
    category: "Politics",
    readTime: "5 min read",
    content: `
      <p>NEW DELHI — Opposition leaders across India have called for nationwide protests following the passage of a controversial bill in Parliament yesterday. The legislation, which critics argue undermines constitutional protections, was passed despite significant resistance from opposition parties.</p>
      
      <p>The bill, formally known as the National Security Reform Act, grants expanded powers to law enforcement agencies for surveillance and detention in cases related to national security. Supporters claim these measures are necessary to combat emerging threats, while detractors warn of potential misuse and erosion of civil liberties.</p>
      
      <p>"This is a dark day for Indian democracy," said opposition leader Rajiv Mehta during a press conference this morning. "We cannot stand by while fundamental rights are being compromised under the guise of national security."</p>
      
      <p>The ruling party has defended the legislation, with Home Minister Arun Patel stating that "the safety of our citizens must remain our highest priority" and assuring that "robust safeguards" are in place to prevent abuse of the new provisions.</p>
      
      <p>Protests are scheduled to begin tomorrow in major cities including Delhi, Mumbai, Kolkata, and Chennai. Police have increased security measures in anticipation of large gatherings.</p>
      
      <p>Constitutional experts remain divided on the legality of certain provisions within the bill, with several suggesting that legal challenges are likely to reach the Supreme Court in the coming weeks.</p>
      
      <p>The Fast and Real News will continue to monitor developments as this story unfolds.</p>
    `,
    relatedArticles: [2, 5, 9],
    imageUrl: "/placeholder.svg?height=600&width=1200",
    tags: ["politics", "protests", "legislation", "democracy", "india"],
    location: "New Delhi, India",
  },
  {
    id: 2,
    title: "Indian Economy Shows Strong Growth in Q2",
    summary: "Economic indicators point to a robust recovery with GDP growth exceeding expectations by 2.3%.",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    author: "Vikram Desai",
    category: "Economy",
    readTime: "4 min read",
    content: `
      <p>MUMBAI — India's economy has shown remarkable resilience in the second quarter of 2025, with GDP growth reaching 7.8%, significantly exceeding analyst expectations of 5.5%. This marks the strongest quarterly performance since the post-pandemic recovery began.</p>
      
      <p>The Finance Ministry attributes this growth to several factors, including increased manufacturing output, a robust agricultural season, and continued expansion in the technology and service sectors. Foreign direct investment has also seen a 15% year-over-year increase.</p>
      
      <p>"These numbers reflect the fundamental strength of our economic framework," said Finance Minister Nirmala Joshi in a statement. "The various reforms implemented over the past two years are now bearing fruit."</p>
      
      <p>The manufacturing sector led the growth with a 9.2% expansion, followed by services at 8.5% and agriculture at 4.3%. Exports have increased by 12.7%, contributing significantly to the overall economic performance.</p>
      
      <p>Economists at major financial institutions have responded by revising their annual growth projections upward. "We're now looking at potential annual growth of 7.2% for the fiscal year, which would position India as the fastest-growing major economy globally," said Rahul Kapoor, Chief Economist at Global Financial Services.</p>
      
      <p>The positive economic data has also strengthened the rupee, which gained 0.8% against the US dollar in today's trading.</p>
      
      <p>Challenges remain, however, with inflation at 4.7% still slightly above the Reserve Bank of India's target range. The RBI is expected to address monetary policy in its upcoming meeting next week.</p>
    `,
    relatedArticles: [7, 9, 3],
    imageUrl: "/placeholder.svg?height=600&width=1200",
    tags: ["economy", "gdp", "growth", "finance", "india"],
    location: "Mumbai, India",
  },
  // Additional articles would be defined here for all 9 articles
]

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<(typeof articles)[0] | null>(null)
  const [currentDateTime, setCurrentDateTime] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [userTimezone, setUserTimezone] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)

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

    // Update date and time
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

    // Find the article based on the ID from the URL
    const id = Number(params.id)
    const foundArticle = articles.find((a) => a.id === id)
    setArticle(foundArticle || null)

    // Check if article is bookmarked
    if (foundArticle) {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")
      setIsBookmarked(bookmarks.includes(id))
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearInterval(interval)
    }
  }, [params.id, userTimezone])

  const toggleBookmark = () => {
    if (!article) return

    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")

    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((id: number) => id !== article.id)
      localStorage.setItem("bookmarkedArticles", JSON.stringify(updatedBookmarks))
    } else {
      bookmarks.push(article.id)
      localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarks))
    }

    setIsBookmarked(!isBookmarked)
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-xl">Loading article...</div>
      </div>
    )
  }

  // Prepare metadata for SEO
  const pageTitle = `${article.title} | The Fast and Real News`
  const pageDescription = article.summary
  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://the-fast-and-real-news.vercel.app/article/${params.id}`
  const pageImage = article.imageUrl

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
                  <span className="bg-white/20 px-3 py-1 rounded-full">{article.category}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </span>
                </div>

                <h1
                  className={`${sora.className} text-3xl md:text-5xl lg:text-6xl font-light italic text-white/90 tracking-tighter leading-[1.2] mb-6`}
                >
                  {article.title}
                </h1>

                <p className="text-white/70 text-lg md:text-xl mb-6">{article.summary}</p>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="text-white/60 text-sm">
                    By {article.author} • <TimeAgo date={article.publishedAt} updateInterval={10000} />
                  </div>
                  <div className="flex space-x-2">
                    {typeof window !== "undefined" && (
                      <SocialShareButtons
                        url={pageUrl}
                        title={article.title}
                        summary={article.summary}
                        hashtags={article.tags}
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
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 75vw"
                  priority
                />
              </div>

              {/* Article Content */}
              <div
                className={`${urbanist.className} text-white/80 text-base md:text-lg leading-relaxed space-y-6 mb-12 md:mb-16`}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white/70 text-sm mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
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
              )}

              {/* Social Share Buttons (Full) */}
              {typeof window !== "undefined" && (
                <div className="mb-12">
                  <h3 className="text-white/70 text-sm mb-4">Share this article:</h3>
                  <SocialShareButtons
                    url={pageUrl}
                    title={article.title}
                    summary={article.summary}
                    hashtags={article.tags}
                    size="sm"
                  />
                </div>
              )}

              <Separator className="bg-white/10 my-8" />

              {/* Comment Section */}
              <CommentSection articleId={article.id} />

              <Separator className="bg-white/10 my-8" />

              {/* Related Articles */}
              <div className="pt-8">
                <h2
                  className={`${georgiaPro.className} text-2xl md:text-3xl font-light italic text-white/80 tracking-tighter mb-6 md:mb-8`}
                >
                  Related Articles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {article.relatedArticles.map((id) => {
                    const relatedArticle = articles.find((a) => a.id === id)
                    if (!relatedArticle) return null

                    return (
                      <div
                        key={id}
                        className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => router.push(`/article/${id}`)}
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={relatedArticle.imageUrl || "/placeholder.svg"}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-white/60 text-xs mb-2">
                            {relatedArticle.category} •{" "}
                            <TimeAgo date={relatedArticle.publishedAt} updateInterval={60000} />
                          </div>
                          <h3 className="text-white font-bold mb-2">{relatedArticle.title}</h3>
                          <p className="text-white/70 text-sm line-clamp-2">{relatedArticle.summary}</p>
                        </div>
                      </div>
                    )
                  })}
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
                    More from TFARN
                  </h3>
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="border-b border-white/10 pb-4 last:border-0 cursor-pointer"
                        onClick={() => router.push(`/article/${a.id}`)}
                      >
                        <div className="text-white/60 text-xs mb-1">{a.category}</div>
                        <h4 className="text-white font-medium text-sm hover:text-white/80 transition-colors">
                          {a.title}
                        </h4>
                        <div className="text-white/50 text-xs mt-1">
                          <TimeAgo date={a.publishedAt} updateInterval={60000} />
                        </div>
                      </div>
                    ))}
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
