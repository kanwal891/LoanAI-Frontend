"use client"

import { useState } from "react"
import {
  User,
  Lock,
  Bell,
  Loader2,
  Check,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [section, setSection] = useState<"settings" | "admin">("settings")
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setJustSaved(false)
    try {
      // TODO: replace with real save logic (API call, server action, etc.)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground">
          {section === "settings"
            ? "Manage your profile, password, and notifications"
            : "Configure platform, AI, and administrative controls"}
        </p>
      </div>

      {section === "settings" && (
        <div className="space-y-6">
          {/* Profile */}
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-primary to-indigo-500 p-2">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-white">Profile</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input defaultValue="Jane Doe" className="border-white/10 bg-white/5" />
              </div>
              <div className="space-y-1">
                <Label>Email Address</Label>
                <Input defaultValue="jane.doe@email.com" className="border-white/10 bg-white/5" />
              </div>
            </div>
          </GlassCard>

          {/* Change Password */}
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-white">Change Password</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" className="border-white/10 bg-white/5" />
              </div>
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" className="border-white/10 bg-white/5" />
              </div>
              <div className="space-y-1">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" className="border-white/10 bg-white/5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Use at least 8 characters with letters, numbers, and a symbol.</p>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-white">Notifications</h2>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive system alerts and updates by email.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </GlassCard>

          {/* Save Changes */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[160px] bg-gradient-to-br from-primary to-indigo-500 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : justSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}