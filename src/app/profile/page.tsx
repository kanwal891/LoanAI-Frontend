"use client"

import { useState } from "react"
import { User, Mail, Phone, Calendar, Pencil, Save, X } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { GlassSidebar } from "@/components/glass-sidebar"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const [profile, setProfile] = useState({
    fullName: "Jane Doe",
    email: "jane.doe@email.com",
    phone: "+91 98765 43210",
  })

  const [draft, setDraft] = useState(profile)

  const startEditing = () => {
    setDraft(profile)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraft(profile)
    setIsEditing(false)
  }

  const saveChanges = () => {
    setProfile(draft)
    setIsEditing(false)
  }

  const fields = [
    { key: "fullName" as const, label: "Full Name", icon: User, gradient: "from-primary to-indigo-500" },
    { key: "email" as const, label: "Email Address", icon: Mail, gradient: "from-amber-500 to-orange-500" },
    { key: "phone" as const, label: "Phone Number", icon: Phone, gradient: "from-emerald-500 to-teal-500" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <GlassSidebar />

      <main className="ml-64 w-full p-6 transition-all duration-300">
        <div className="w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-muted-foreground">Your account details</p>
          </div>

          <GlassCard className="w-full p-6">
            {/* Avatar + Name + Edit button */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-xl font-semibold text-white">
                  {profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{profile.fullName}</h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveChanges}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Details — full-width single-column rows */}
            <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-6">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                  <div className={`shrink-0 rounded-lg bg-gradient-to-br p-2 ${field.gradient}`}>
                    <field.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    {isEditing ? (
                      <input
                        value={draft[field.key]}
                        onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm font-medium text-white focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="font-medium text-white">{profile[field.key]}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Member Since stays read-only, not user-editable */}
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <div className="shrink-0 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 p-2">
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