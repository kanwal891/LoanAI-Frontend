"use client"

import React, { useState, useEffect } from "react"
import {
  AlertTriangle,
  FileText,
  Percent,
  Landmark,
  Tag,
  Check,
  X,
  Edit3,
  Save,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Code2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface PolicyDataEditorProps {
  data: Record<string, any>
  readOnly?: boolean
  onSave?: (updatedData: Record<string, any>) => void
}

interface ReviewItem {
  id: string
  sourcePhrase: string
  targetField: string
  suggestedInterpretation: string
  status: "pending" | "accepted" | "rejected"
}

type SectionKey =
  | "review"
  | "eligibility"
  | "foir"
  | "limits"
  | "pricing"
  | "special"
  | "raw_json"

export function PolicyDataEditor({
  data,
  readOnly = false,
  onSave,
}: PolicyDataEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(data || {})
  
  // Section Visibility State (Default: 'review' is open, others closed)
  const [activeSection, setActiveSection] = useState<SectionKey>("review")

  // Inline editing state for Ambiguous Phrases
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editText, setEditText] = useState<string>("")

  // Raw JSON state
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(data || {}, null, 2)
  )
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    setFormData(data || {})
    setJsonText(JSON.stringify(data || {}, null, 2))
  }, [data])

  // Mock ambiguous phrases queue (Syncs with state)
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([
    {
      id: "rev-1",
      sourcePhrase: "Agar koi listed nhi hai toh nhi krege",
      targetField: "Ineligible Profiles",
      suggestedInterpretation: "Unlisted employer companies are not eligible.",
      status: "pending",
    },
    {
      id: "rev-2",
      sourcePhrase: "ABB calculation 3-7-12-30/31",
      targetField: "Eligibility Rules",
      suggestedInterpretation: "Average Bank Balance (ABB) calculated on dates 3, 7, 12, and 30/31.",
      status: "pending",
    },
  ])

  // Field change handler
  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value }
    setFormData(updated)
    setJsonText(JSON.stringify(updated, null, 2))
    if (onSave) onSave(updated)
  }

  // Handle Raw JSON edit
  const handleJsonChange = (val: string) => {
    setJsonText(val)
    try {
      const parsed = JSON.parse(val)
      setFormData(parsed)
      setJsonError(null)
      if (onSave) onSave(parsed)
    } catch {
      setJsonError("Invalid JSON syntax")
    }
  }

  const toggleSection = (section: SectionKey) => {
    setActiveSection(section)
  }

  // Review Handlers
  const startEditingReview = (item: ReviewItem) => {
    setEditingReviewId(item.id)
    setEditText(item.suggestedInterpretation)
  }

  const saveReviewEdit = (id: string) => {
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, suggestedInterpretation: editText } : item
      )
    )
    setEditingReviewId(null)
    if (onSave) onSave(formData)
  }

  const handleReviewAction = (id: string, action: "accepted" | "rejected") => {
    setReviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    )
    if (onSave) onSave(formData)
  }

  const sectionsList: { key: SectionKey; label: string; icon: any; badge?: number }[] = [
    {
      key: "review",
      label: "Review Queue",
      icon: AlertTriangle,
      badge: reviewItems.filter((i) => i.status === "pending").length,
    },
    { key: "eligibility", label: "Eligibility Rules", icon: FileText },
    { key: "foir", label: "FOIR & Obligations", icon: Percent },
    { key: "limits", label: "Loan Limits & LTV", icon: Landmark },
    { key: "pricing", label: "Pricing & ROI", icon: Tag },
    { key: "special", label: "Special Conditions", icon: ShieldAlert },
    { key: "raw_json", label: "Raw JSON Editor", icon: Code2 },
  ]

  return (
    <div className="w-full space-y-6 text-slate-100">
      
      {/* SECTION TABS / NAVIGATION HEADER */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
        {sectionsList.map((sec) => {
          const Icon = sec.icon
          const isActive = activeSection === sec.key
          return (
            <button
              key={sec.key}
              onClick={() => toggleSection(sec.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all",
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sec.label}</span>
              {sec.badge !== undefined && sec.badge > 0 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/30">
                  {sec.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ACTIVE SECTION CONTENT CONTAINER */}
      <div className="bg-slate-900/60 rounded-xl border border-white/10 p-5 space-y-4">

        {/* 1. REVIEW QUEUE SECTION */}
        {activeSection === "review" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Ambiguous Phrases Needing Review
              </h3>
              <span className="text-xs text-slate-400">
                {reviewItems.filter((i) => i.status === "pending").length} items remaining
              </span>
            </div>

            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 rounded-xl border bg-slate-950/80 space-y-3 transition-all",
                    item.status === "pending" && "border-amber-500/40 border-l-4 border-l-amber-400",
                    item.status === "accepted" && "border-emerald-500/30 border-l-4 border-l-emerald-500 opacity-80",
                    item.status === "rejected" && "border-white/10 opacity-40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded text-xs font-mono text-amber-300">
                      Source Phrase: &ldquo;{item.sourcePhrase}&rdquo;
                    </span>
                    <span className="text-xs text-slate-400">Target Field: <strong>{item.targetField}</strong></span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">AI Suggested Interpretation:</Label>
                    {editingReviewId === item.id && !readOnly ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-xs h-9"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveReviewEdit(item.id)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs h-9 shrink-0 font-medium"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingReviewId(null)}
                          className="text-xs h-9"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-100 bg-slate-900/90 p-3 rounded-lg border border-white/5 leading-relaxed">
                        {item.suggestedInterpretation}
                      </p>
                    )}
                  </div>

                  {!readOnly && item.status === "pending" && editingReviewId !== item.id && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleReviewAction(item.id, "accepted")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-3"
                      >
                        <Check className="w-3 h-3 mr-1" /> Accept Interpretation
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditingReview(item)}
                        className="border-slate-700 bg-slate-800 text-xs h-7 px-3"
                      >
                        <Edit3 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReviewAction(item.id, "rejected")}
                        className="text-rose-400 hover:bg-rose-500/10 text-xs h-7 px-2.5"
                      >
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ELIGIBILITY RULES */}
        {activeSection === "eligibility" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Complete Eligibility Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-400">Min Monthly Income (₹)</Label>
                <Input
                  disabled={readOnly}
                  value={formData.min_salary || ""}
                  onChange={(e) => handleFieldChange("min_salary", e.target.value)}
                  placeholder="e.g. 30000"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Min CIBIL Score</Label>
                <Input
                  disabled={readOnly}
                  value={formData.min_cibil || ""}
                  onChange={(e) => handleFieldChange("min_cibil", e.target.value)}
                  placeholder="e.g. 700"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Age Eligibility (Min / Max)</Label>
                <Input
                  disabled={readOnly}
                  value={formData.age_limit || ""}
                  onChange={(e) => handleFieldChange("age_limit", e.target.value)}
                  placeholder="e.g. 21 to 60 years"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-400">Allowed Employer Categories</Label>
              <Input
                disabled={readOnly}
                value={formData.allowed_employers || ""}
                onChange={(e) => handleFieldChange("allowed_employers", e.target.value)}
                placeholder="e.g. CAT A, CAT B, Govt, Public Sector MNCs"
                className="bg-slate-950 border-slate-800 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-400">Ineligible Profiles / Restrictions</Label>
              <Textarea
                disabled={readOnly}
                value={formData.ineligible_profiles || ""}
                onChange={(e) => handleFieldChange("ineligible_profiles", e.target.value)}
                placeholder="e.g. Unlisted Companies, Proprietorships, Defense"
                className="bg-slate-950 border-slate-800 text-xs mt-1 min-h-[90px]"
              />
            </div>
          </div>
        )}

        {/* 3. FOIR & OBLIGATIONS */}
        {activeSection === "foir" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" /> Fixed Obligation to Income Ratio (FOIR)
            </h3>

            <div>
              <Label className="text-xs text-slate-400">Income Slab Matrix & FOIR %</Label>
              <Textarea
                disabled={readOnly}
                value={formData.foir_rules || ""}
                onChange={(e) => handleFieldChange("foir_rules", e.target.value)}
                placeholder="e.g. Income < 30k = 50% FOIR; 30k-50k = 60% FOIR; > 50k = 65% FOIR"
                className="bg-slate-950 border-slate-800 text-xs mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-400">Obligation Deduction Rules</Label>
              <Textarea
                disabled={readOnly}
                value={formData.obligation_rules || ""}
                onChange={(e) => handleFieldChange("obligation_rules", e.target.value)}
                placeholder="e.g. Existing EMIs > 6 months left, Credit Card 5% of limit, FOIR includes rent"
                className="bg-slate-950 border-slate-800 text-xs mt-1 min-h-[80px]"
              />
            </div>
          </div>
        )}

        {/* 4. LOAN LIMITS & LTV */}
        {activeSection === "limits" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" /> Loan Amounts, Tenure & LTV Limits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-400">Min Loan Amount (₹)</Label>
                <Input
                  disabled={readOnly}
                  value={formData.min_loan_amount || ""}
                  onChange={(e) => handleFieldChange("min_loan_amount", e.target.value)}
                  placeholder="e.g. 100000"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Max Loan Amount (₹)</Label>
                <Input
                  disabled={readOnly}
                  value={formData.max_loan_amount || ""}
                  onChange={(e) => handleFieldChange("max_loan_amount", e.target.value)}
                  placeholder="e.g. 4000000"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Max Tenure (Months)</Label>
                <Input
                  disabled={readOnly}
                  value={formData.max_tenure || ""}
                  onChange={(e) => handleFieldChange("max_tenure", e.target.value)}
                  placeholder="e.g. 60 Months"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. PRICING & ROI */}
        {activeSection === "pricing" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" /> Interest Rates & Processing Fees
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-400">Rate of Interest (ROI %)</Label>
                <Input
                  disabled={readOnly}
                  value={formData.roi || ""}
                  onChange={(e) => handleFieldChange("roi", e.target.value)}
                  placeholder="e.g. 10.5% - 14.0% p.a."
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Processing Fee</Label>
                <Input
                  disabled={readOnly}
                  value={formData.processing_fee || ""}
                  onChange={(e) => handleFieldChange("processing_fee", e.target.value)}
                  placeholder="e.g. 1% to 2% + GST"
                  className="bg-slate-950 border-slate-800 text-xs mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. SPECIAL CONDITIONS */}
        {activeSection === "special" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Special Conditions & Calculations
            </h3>

            <div>
              <Label className="text-xs text-slate-400">Special Notes & Banking Rules</Label>
              <Textarea
                disabled={readOnly}
                value={formData.special_conditions || ""}
                onChange={(e) => handleFieldChange("special_conditions", e.target.value)}
                placeholder="e.g. Average Bank Balance (ABB) evaluated on 3rd, 7th, 12th, and 30th of month."
                className="bg-slate-950 border-slate-800 text-xs mt-1 min-h-[100px]"
              />
            </div>
          </div>
        )}

        {/* 7. RAW JSON EDITOR */}
        {activeSection === "raw_json" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" /> Complete Extracted JSON Tree
              </h3>
              {jsonError && <span className="text-xs text-rose-400 font-medium">{jsonError}</span>}
            </div>

            <Textarea
              disabled={readOnly}
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="font-mono text-xs bg-slate-950 border-slate-800 text-emerald-400 min-h-[300px] leading-relaxed"
            />
          </div>
        )}

      </div>

      {/* FOOTER: Source Evidence Reference */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Source Evidence Excerpt</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Page 3
          </span>
        </div>
        <blockquote className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-white/5 leading-relaxed border-l-2 border-l-emerald-400">
          &ldquo;IF salary is less than 30k, FOIR = 50%. Salary between 30k to 50k, FOIR = 60%. Unlisted companies are not eligible.&rdquo;
        </blockquote>
      </div>

    </div>
  )
}