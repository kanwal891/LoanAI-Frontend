"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCcw,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "upload",
    title: "Document Uploaded",
    description: "HDFC Bank Credit Policy v3.2",
    user: "Admin User",
    time: "2 min ago",
    icon: Upload,
    iconBg: "from-primary to-indigo-500",
  },
  {
    id: 2,
    type: "indexed",
    title: "Indexing Complete",
    description: "ICICI FOIR Guidelines indexed",
    user: "System",
    time: "5 min ago",
    icon: Database,
    iconBg: "from-cyan-500 to-blue-500",
  },
  {
    id: 3,
    type: "approved",
    title: "Document Approved",
    description: "Axis Bank Eligibility Matrix",
    user: "Review Team",
    time: "12 min ago",
    icon: CheckCircle,
    iconBg: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    type: "failed",
    title: "Processing Failed",
    description: "SBI Policy - Invalid format",
    user: "System",
    time: "18 min ago",
    icon: AlertTriangle,
    iconBg: "from-red-500 to-orange-500",
  },
  {
    id: 5,
    type: "reindex",
    title: "Re-indexing Started",
    description: "Kotak Credit Risk Rules v2.0",
    user: "Admin User",
    time: "25 min ago",
    icon: RefreshCcw,
    iconBg: "from-violet-500 to-purple-500",
  },
  {
    id: 6,
    type: "upload",
    title: "New Version Added",
    description: "Yes Bank ROI Policy v1.5",
    user: "Admin User",
    time: "32 min ago",
    icon: FileText,
    iconBg: "from-amber-500 to-yellow-500",
  },
]

export function ActivityFeed() {
  return (
    <GlassCard className="h-full p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Recent Activity</h3>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-3"
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                activity.iconBg
              )}
            >
              <activity.icon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{activity.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {activity.description}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activity.user}</span>
                <span>•</span>
                <span>{activity.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
