"use client"

import { memo, useMemo, useState } from "react"
import { GlassCard } from "@/components/glass-card"
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

const monthlyAccuracyData = [
  {
    month: "Jan",
    accuracy: 82,
    likes: 18,
    dislikes: 5,
    topLiked: "CIBIL 720 eligibility check",
    topDisliked: "Salary ₹18,000 EMI query",
    comment: "Need more details on age cutoff",
  },
  {
    month: "Feb",
    accuracy: 86,
    likes: 24,
    dislikes: 4,
    topLiked: "Loan tenor recommendation",
    topDisliked: "LTV calculation unclear",
    comment: "Show alternate bank options",
  },
  {
    month: "Mar",
    accuracy: 90,
    likes: 31,
    dislikes: 3,
    topLiked: "Policy match for HDFC",
    topDisliked: "Case study follow-up missing",
    comment: "Good accuracy on bank rules",
  },
  {
    month: "Apr",
    accuracy: 93,
    likes: 37,
    dislikes: 2,
    topLiked: "CIBIL threshold details",
    topDisliked: "Need better rejection reason",
    comment: "Great improvement over last quarter",
  },
  {
    month: "May",
    accuracy: 91,
    likes: 34,
    dislikes: 4,
    topLiked: "ROI and eligibility summary",
    topDisliked: "Policy comparison too brief",
    comment: "Would like more bank comparison output",
  },
  {
    month: "Jun",
    accuracy: 94,
    likes: 40,
    dislikes: 2,
    topLiked: "Hinglish query handling",
    topDisliked: "Need more case study context",
    comment: "Excellent handling of real cases",
  },
]

const categoryData = [
  { name: "Bank Policy", value: 520, color: "#1B4FBB" },
  { name: "Case Study", value: 320, color: "#06B6D4" },
]

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
  const [selectedPoint, setSelectedPoint] = useState(monthlyAccuracyData[0])

  const actionableFeedback = useMemo(
    () => feedbackHistory.filter((item) => item.reaction === "dislike" && item.comment?.trim()),
    []
  )

  return (
    <div className="space-y-6">
      {/* Monthly Accuracy */}
      <GlassCard className="p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-white">Monthly Accuracy Trend</h3>
            <p className="text-sm text-muted-foreground">
              Sample AI response accuracy and feedback over time.
            </p>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-white">
            Overall accuracy: <span className="font-semibold">91.0%</span>
          </div>
        </div>

        <div className="h-64">
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
      </GlassCard>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Category Distribution */}
        <GlassCard className="p-6">
          <h3 className="mb-4 font-semibold text-white">Knowledge Base Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Like / Dislike Trend */}
        <GlassCard className="p-6">
          <h3 className="mb-4 font-semibold text-white">Like vs Dislike Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyAccuracyData}
                onClick={(event: any) => {
                  const payload = event?.activePayload?.[0]?.payload
                  if (payload) setSelectedPoint(payload)
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="likes"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  name="Likes"
                />
                <Bar
                  dataKey="dislikes"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  name="Dislikes"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            {selectedPoint.month}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="mt-2 text-2xl font-semibold text-white">{selectedPoint.accuracy}%</p>
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
            <p className="text-xs text-muted-foreground">Top liked query</p>
            <p className="mt-2 text-sm text-white">{selectedPoint.topLiked}</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs text-muted-foreground">Top disliked query</p>
            <p className="mt-2 text-sm text-white">{selectedPoint.topDisliked}</p>
          </div>
        </div>
      </GlassCard>
     
    </div>
  )
}