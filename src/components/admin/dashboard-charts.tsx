"use client"

import { memo, useEffect, useMemo, useState } from "react"
import { GlassCard } from "@/components/glass-card"
import { AlertCircle } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { listKnowledgeDocuments, type KnowledgeDocumentRead, type DocumentCategory } from "@/lib/api"
import {
  getApplicationFeedbackTrends,
  type FeedbackTrendMonth,
} from "@/lib/userAPI"

// Fetch enough trailing months from the API to guarantee full Jan–Dec
// coverage of the current calendar year no matter what month "today" is
// (e.g. in January we'd otherwise only get January back from a 12-month
// trailing window). The result is then reshaped into a fixed Jan–Dec set
// below, so this just needs to be comfortably >= 12.
const FETCH_MONTHS_WINDOW = 18

// The chart now always shows a fixed Jan–Dec (12 month) series, so this
// threshold is set above 12 — no horizontal scroll needed for the normal
// case. Left in place as a safety net if MONTH_ABBR ever changes.
const MONTHS_BEFORE_SCROLL = 14
const MIN_PX_PER_MONTH = 64

type MonthChartPoint = {
  month: string
  monthKey: string
  accuracy: number
  likes: number
  dislikes: number
  topLiked: string
  topDisliked: string
}

function toChartPoint(m: FeedbackTrendMonth): MonthChartPoint {
  return {
    month: m.label,
    monthKey: m.month,
    accuracy: m.accuracy ?? 0,
    likes: m.likes,
    dislikes: m.dislikes,
    topLiked: m.top_liked?.label ?? "—",
    topDisliked: m.top_disliked?.label ?? "—",
  }
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/**
 * Reshapes whatever trailing-window data the API returned into a fixed
 * Jan–Dec series for the given year. Months with no matching data (future
 * months, or months before feedback existed) are filled in as zero-value
 * points so the x-axis always reads Jan through Dec in order.
 */
function toCalendarYear(points: MonthChartPoint[], year: number): MonthChartPoint[] {
  const byMonthKey = new Map(points.map((p) => [p.monthKey, p]))
  return MONTH_ABBR.map((label, idx) => {
    const monthKey = `${year}-${String(idx + 1).padStart(2, "0")}`
    const existing = byMonthKey.get(monthKey)
    if (existing) return existing
    return {
      month: label,
      monthKey,
      accuracy: 0,
      likes: 0,
      dislikes: 0,
      topLiked: "—",
      topDisliked: "—",
    }
  })
}

function useFeedbackTrends(months = 6) {
  const [points, setPoints] = useState<MonthChartPoint[]>([])
  const [overallAccuracy, setOverallAccuracy] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getApplicationFeedbackTrends(months)
        if (cancelled) return
        setPoints(res.months.map(toChartPoint))
        setOverallAccuracy(res.overall_accuracy)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load feedback trends")
          setPoints([])
          setOverallAccuracy(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [months])

  return { points, overallAccuracy, isLoading, error }
}

// Display labels + chart colors for each backend category value.
// Keys must match the `DocumentCategory` union from lib/api.
const CATEGORY_META: Record<DocumentCategory, { label: string; color: string }> = {
  bank_policy: { label: "Bank Policy", color: "#1B4FBB" },
  case_study: { label: "Case Study", color: "#06B6D4" },
}

function useKnowledgeDistribution() {
  const [documents, setDocuments] = useState<KnowledgeDocumentRead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const docs = await listKnowledgeDocuments()
        if (!cancelled) setDocuments(docs)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load documents")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const categoryData = useMemo(() => {
    const counts = new Map<DocumentCategory, number>()
    for (const doc of documents) {
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1)
    }
    return (Object.keys(CATEGORY_META) as DocumentCategory[])
      .map((key) => ({
        name: CATEGORY_META[key].label,
        value: counts.get(key) ?? 0,
        color: CATEGORY_META[key].color,
      }))
      .filter((entry) => entry.value > 0)
  }, [documents])

  return { categoryData, totalDocuments: documents.length, isLoading, error }
}

interface FeedbackEntry {
  id: string
  user: string
  bank: string
  confidence: string
  query: string
  response: string
  reaction: "like" | "dislike"
  comment: string
  date: string
  time: string
  accuracy: "Correct" | "Incorrect"
}

const feedbackHistory: FeedbackEntry[] = [
  {
    id: "1",
    user: "Rohan Mehta",
    bank: "HDFC Bank",
    confidence: "82%",
    query: "Meri salary 21,000 hai aur CIBIL 680, loan milega?",
    response: "HDFC likely reject due to age policy; SBI is a better option.",
    reaction: "dislike",
    comment: "Please mention alternate bank reasons.",
    date: "2026-07-10",
    time: "10:42 AM",
    accuracy: "Incorrect",
  },
  {
    id: "2",
    user: "Priya Sharma",
    bank: "ICICI Bank",
    confidence: "95%",
    query: "Can I get a loan with CIBIL 720 and salary 35k?",
    response: "Yes, HDFC and ICICI are eligible with current profile.",
    reaction: "like",
    comment: "Clear and helpful answer.",
    date: "2026-07-12",
    time: "03:15 PM",
    accuracy: "Correct",
  },
  {
    id: "3",
    user: "Amit Kumar",
    bank: "SBI",
    confidence: "89%",
    query: "Loan against property with existing 5L EMI?",
    response: "LTV limits are near threshold; consider alternate bank offers.",
    reaction: "like",
    comment: "Good comparison guidance.",
    date: "2026-07-14",
    time: "11:30 AM",
    accuracy: "Correct",
  },
  {
    id: "4",
    user: "Neha Verma",
    bank: "Axis Bank",
    confidence: "76%",
    query: "Self-employed, income ₹40,000/month, CIBIL 705 — eligible?",
    response: "Axis Bank likely eligible with standard documentation.",
    reaction: "dislike",
    comment: "Didn't account for self-employed income proof requirements — please clarify document list.",
    date: "2026-07-16",
    time: "01:05 PM",
    accuracy: "Incorrect",
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0a0f1a] p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}

// Separate from CustomTooltip (used by the month-based Area/Bar charts,
// which show a month label heading) — pie slices have no such label, so
// reusing that component showed a stray "0" (recharts' default index-based
// label) above the category name on hover.
const CategoryTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0]
    return (
      <div className="rounded-lg border border-white/10 bg-[#0a0f1a] p-3 shadow-xl">
        <p className="text-xs text-muted-foreground">
          <span style={{ color: entry.payload.color }}>{entry.name}: </span>
          {entry.value}
        </p>
      </div>
    )
  }
  return null
}
const FeedbackCard = memo(function FeedbackCard({ item }: { item: FeedbackEntry }) {
  const isCorrect = item.accuracy === "Correct"

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 transition-colors hover:border-white/20">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500/30 to-cyan-400/30 text-xs font-semibold text-white">
          {initialsOf(item.user)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-white">{item.user}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{item.bank}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  isCorrect
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-red-500/15 text-red-300"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-red-500/15 text-red-300">
                👎 Dislike
              </span>
            </div>
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground">
            {item.date} · {item.time} · Confidence {item.confidence}
          </p>

          <p className="mt-3 border-l-2 border-white/15 pl-3 text-sm italic text-white/90">
            &ldquo;{item.query}&rdquo;
          </p>

          <div className="mt-3 rounded-xl bg-white/4 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-blue-300/80">
              AI Response
            </p>
            <p className="mt-1.5 text-sm text-white/85">{item.response}</p>
          </div>

          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-amber-500/[0.07] px-3 py-2.5">
            <span className="mt-0.5 text-amber-300">💬</span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-300/90">
                User Feedback
              </p>
              <p className="mt-0.5 text-sm text-white/85">{item.comment}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export function DashboardCharts() {
  const {
    points: rawTrendPoints,
    overallAccuracy,
    isLoading: isLoadingTrends,
    error: trendsError,
  } = useFeedbackTrends(FETCH_MONTHS_WINDOW)
  const monthlyAccuracyData = useMemo(
    () => toCalendarYear(rawTrendPoints, new Date().getFullYear()),
    [rawTrendPoints]
  )
  const [selectedPoint, setSelectedPoint] = useState<MonthChartPoint | null>(null)
  const {
    categoryData,
    totalDocuments,
    isLoading: isLoadingDistribution,
    error: distributionError,
  } = useKnowledgeDistribution()

  useEffect(() => {
    if (rawTrendPoints.length === 0 && monthlyAccuracyData.every((p) => p.likes === 0 && p.dislikes === 0)) {
      setSelectedPoint(null)
      return
    }
    setSelectedPoint((prev) => {
      if (prev) {
        const match = monthlyAccuracyData.find((p) => p.monthKey === prev.monthKey)
        if (match) return match
      }
      // Default to the current calendar month rather than always December,
      // since trailing months of the fixed Jan–Dec series are zero-filled
      // placeholders until feedback actually comes in.
      const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
      return (
        monthlyAccuracyData.find((p) => p.monthKey === currentMonthKey) ??
        monthlyAccuracyData[monthlyAccuracyData.length - 1]
      )
    })
  }, [monthlyAccuracyData, rawTrendPoints.length])

  const actionableFeedback = useMemo(
    () => feedbackHistory.filter((item) => item.reaction === "dislike" && item.comment?.trim()),
    []
  )

  // Once there are enough months to feel cramped, give each bar group a
  // fixed minimum width and let the chart scroll horizontally instead of
  // compressing every bar into an unreadable sliver.
  const needsScroll = monthlyAccuracyData.length > MONTHS_BEFORE_SCROLL
  const likeDislikeChartWidth = needsScroll
    ? monthlyAccuracyData.length * MIN_PX_PER_MONTH
    : undefined

  return (
    <div className="space-y-6">
      {/* Monthly Accuracy */}
      <GlassCard className="p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-white">Monthly Accuracy Trend</h3>
            <p className="text-sm text-muted-foreground">
              Satisfaction from application feedback (likes ÷ total reactions) — Jan–Dec {new Date().getFullYear()}.
            </p>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-white">
            Overall accuracy:{" "}
            <span className="font-semibold">
              {overallAccuracy != null ? `${overallAccuracy}%` : "—"}
            </span>
          </div>
        </div>

        {trendsError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {trendsError}
          </div>
        )}

        <div className="h-64">
          {isLoadingTrends ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading feedback trends…
            </div>
          ) : rawTrendPoints.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No feedback yet — likes/dislikes will appear here.
            </div>
          ) : (
            <div className={needsScroll ? "h-full overflow-x-auto" : "h-full"}>
              <div
                className="h-full"
                style={likeDislikeChartWidth ? { minWidth: likeDislikeChartWidth } : undefined}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyAccuracyData}
                    onClick={(event: any) => {
                      const payload = event?.activePayload?.[0]?.payload
                      if (payload) setSelectedPoint(payload)
                    }}
                  >
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#accuracyGradient)"
                      strokeWidth={2}
                      name="Accuracy"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <GlassCard className="p-6 md:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-white">Like vs Dislike Trend</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 rounded-full bg-white/5 px-3 py-1.5">
                <span className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  Likes
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                  Dislikes
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Jan–Dec {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <div className="h-52">
            {isLoadingTrends ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : rawTrendPoints.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No feedback data yet
              </div>
            ) : (
              <div className={needsScroll ? "h-full overflow-x-auto" : "h-full"}>
                <div
                  className="h-full"
                  style={likeDislikeChartWidth ? { minWidth: likeDislikeChartWidth } : undefined}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyAccuracyData}
                      barGap={4}
                      barCategoryGap="24%"
                      onClick={(event: any) => {
                        const payload = event?.activePayload?.[0]?.payload
                        if (payload) setSelectedPoint(payload)
                      }}
                    >
                      <defs>
                        <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.55} />
                        </linearGradient>
                        <linearGradient id="dislikesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.55} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar
                        dataKey="likes"
                        fill="url(#likesGradient)"
                        radius={[6, 6, 0, 0]}
                        name="Likes"
                        maxBarSize={28}
                      />
                      <Bar
                        dataKey="dislikes"
                        fill="url(#dislikesGradient)"
                        radius={[6, 6, 0, 0]}
                        name="Dislikes"
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Category Distribution — now live from /knowledge/documents,
            grouped by the `category` field (bank_policy | case_study).
            Redesigned as a true donut with the total document count
            overlaid in the center, and the legend as rounded pill chips
            (color dot + label + count + %) instead of a plain stacked list. */}
        <GlassCard className="max-w-[480px] w-full mx-auto p-5 md:col-span-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Knowledge Base Distribution</h3>
          </div>
          {!isLoadingDistribution && !distributionError && (
            <span className="text-xs text-muted-foreground">{totalDocuments} total</span>
          )}

          {distributionError && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {distributionError}
            </div>
          )}

          {isLoadingDistribution ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : categoryData.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No documents yet
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              {/* Donut with the total count centered inside the ring —
                  relative/absolute overlay so the number sits dead-center
                  regardless of container size. */}
              <div className="relative h-36 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-white">{totalDocuments}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Documents
                  </span>
                </div>
              </div>

              {/* Legend — pill chips instead of a plain list */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categoryData.map((item) => {
                  const pct = totalDocuments > 0 ? Math.round((item.value / totalDocuments) * 100) : 0
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                    >
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-white/85">{item.name}</span>
                      <span className="text-xs font-medium text-white">{item.value}</span>
                      <span className="text-[11px] text-muted-foreground">({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-white">Selected Month Details</h3>
            <p className="text-sm text-muted-foreground">
              Click any chart point to inspect feedback and accuracy details.
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-white">
            {selectedPoint?.month ?? "—"}
          </span>
        </div>

        {!selectedPoint ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No month selected — feedback will show here once users rate recommendations.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">Accuracy</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {selectedPoint.accuracy}%
                </p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">Likes</p>
                <p className="mt-2 text-2xl font-semibold text-white">{selectedPoint.likes}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">Dislikes</p>
                <p className="mt-2 text-2xl font-semibold text-white">{selectedPoint.dislikes}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">Top liked case</p>
                <p className="mt-2 text-sm text-white">{selectedPoint.topLiked}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">Top disliked feedback</p>
                <p className="mt-2 text-sm text-white">{selectedPoint.topDisliked}</p>
              </div>
            </div>
          </>
        )}
      </GlassCard>
     
    </div>
  )
}