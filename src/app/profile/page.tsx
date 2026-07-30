"use client"

import { User, Mail, Phone, Calendar } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { GlassSidebar } from "@/components/glass-sidebar"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <GlassSidebar />

      <main className="ml-64 p-6 transition-all duration-300">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-muted-foreground">Your account details</p>
          </div>

          <GlassCard className="p-6">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-xl font-semibold text-white">
                JD
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Jane Doe</h2>
                <p className="text-sm text-muted-foreground">jane.doe@email.com</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <div className="rounded-lg bg-gradient-to-br from-primary to-indigo-500 p-2">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium text-white">Jane Doe</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="font-medium text-white">jane.doe@email.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium text-white">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <div className="rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 p-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium text-white">January 2026</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}