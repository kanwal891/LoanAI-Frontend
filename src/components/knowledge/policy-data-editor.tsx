"use client"

import React, { useState, useEffect } from "react"
import {
  FileText,
  Percent,
  Landmark,
  Tag,
  Plus,
  Trash2,
  ShieldAlert,
  BookOpen,
  Info,
  ListPlus,
  Languages,
  Pencil,
  Check,
  Save,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface PolicyDataEditorProps {
  data: Record<string, any>
  readOnly?: boolean
  onSave?: (updatedData: Record<string, any>) => void | Promise<void>
  // Fires whenever local edits diverge from the last-saved data, so a
  // parent (e.g. the review page) can disable "Approve" until changes
  // are explicitly saved — prevents approving over lost/stale edits.
  onDirtyChange?: (isDirty: boolean) => void
}

type SectionKey =
  | "interpretations"
  | "eligibility"
  | "foir"
  | "limits"
  | "pricing"
  | "exclusions"
  | "sources"
  | "extra"

const isArr = (v: any) => Array.isArray(v)
const isObj = (v: any) => v && typeof v === "object" && !Array.isArray(v)
const isScalar = (v: any) => !isArr(v) && !isObj(v)
const arr = (v: any): any[] => (isArr(v) ? v : [])
const str = (v: any): string => (v === null || v === undefined ? "" : String(v))
const obj = (v: any): Record<string, any> => (isObj(v) ? v : {})
const hasValue = (v: any): boolean => v !== null && v !== undefined && String(v).trim() !== ""

/** "max_foir_percent" -> "Max Foir Percent" */
const prettyLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

export function PolicyDataEditor({
  data,
  readOnly = false,
  onSave,
  onDirtyChange,
}: PolicyDataEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(data || {})
  const [activeSection, setActiveSection] = useState<SectionKey>("interpretations")
  const [editingIndexes, setEditingIndexes] = useState<Set<number>>(new Set())

  // Local-edit tracking, separate from the network save. Editing no
  // longer writes to the backend on every keystroke — it only flips
  // this flag, which the "Save Changes" button below clears.
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setFormData(data || {})
    setIsDirty(false)
  }, [data])

  useEffect(() => {
    onDirtyChange?.(isDirty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  // Local-only update — no network call. Replaces the old `commit`
  // which called onSave (a network write) on every single edit.
  const commit = (updated: Record<string, any>) => {
    setFormData(updated)
    setIsDirty(true)
    setSaveError(null)
  }

  const handleSaveChanges = async () => {
    if (!onSave || isSaving) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await onSave(formData)
      setIsDirty(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const setPath = (path: string, value: any) => {
    const parts = path.split(".")
    const updated = { ...formData }
    let cursor: any = updated
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i]
      cursor[key] = { ...(cursor[key] ?? {}) }
      cursor = cursor[key]
    }
    cursor[parts[parts.length - 1]] = value
    commit(updated)
  }

  const setArrayPath = (path: string, newArr: any[]) => setPath(path, newArr)

  const updateStringArrayItem = (path: string, index: number, value: string) => {
    const current = arr(
      path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), formData as any)
    ).slice()
    current[index] = value
    setArrayPath(path, current)
  }
  const removeStringArrayItem = (path: string, index: number) => {
    const current = arr(
      path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), formData as any)
    )
    setArrayPath(path, current.filter((_, i) => i !== index))
  }
  const addStringArrayItem = (path: string) => {
    const current = arr(
      path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), formData as any)
    )
    setArrayPath(path, [...current, ""])
  }

  // -------------------------------------------------------------------
  const interpretations: any[] = arr(formData.interpretations)

  const eligibility = obj(formData.eligibility)
  const foir = obj(formData.foir)
  const ltv = obj(formData.ltv)
  const tenure = obj(formData.tenure)
  const pricing = obj(formData.pricing)
  const loanLimits = obj(formData.loan_limits)
  const comparison = obj(formData.comparison)

  const exclusions = arr(formData.exclusions)
  const documentsRequired = arr(formData.documents_required)
  const sources = arr(formData.sources)
  const extraPoints = arr(formData.extra_points)
  const detectedProducts = arr(formData.detected_products)

  const sectionHasAnyData = (o: Record<string, any>) =>
    Object.values(o).some((v) => (isArr(v) ? v.length > 0 : isObj(v) ? Object.keys(v).length > 0 : hasValue(v)))

  const eligibilityHasData = sectionHasAnyData(eligibility) || sectionHasAnyData(comparison)
  const foirHasData = sectionHasAnyData(foir)
  const limitsHasData = sectionHasAnyData(loanLimits) || sectionHasAnyData(tenure) || sectionHasAnyData(ltv)
  const pricingHasData = sectionHasAnyData(pricing) || hasValue(formData.notes)
  const exclusionsHasData = exclusions.length > 0 || documentsRequired.length > 0 || detectedProducts.length > 0

  // Toggle inline edit mode for a single interpretation card
  const toggleEditing = (index: number) => {
    setEditingIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Edit the user prompt (original source text)
  const setInterpretationPrompt = (index: number, value: string) => {
    const current = interpretations.slice()
    current[index] = { ...obj(current[index]), sourcePhrase: value }
    setPath("interpretations", current)
  }

  // Edit the AI recommendation (suggested interpretation)
  const setInterpretationText = (index: number, value: string) => {
    const current = interpretations.slice()
    current[index] = { ...obj(current[index]), suggestedInterpretation: value }
    setPath("interpretations", current)
  }

  const sectionsList: { key: SectionKey; label: string; icon: any; badge?: number }[] = [
    { key: "interpretations", label: "Interpretations", icon: Languages, badge: interpretations.length || undefined },
    { key: "eligibility", label: "Eligibility Rules", icon: FileText },
    { key: "foir", label: "FOIR & Obligations", icon: Percent },
    { key: "limits", label: "Loan Limits & Tenure", icon: Landmark },
    { key: "pricing", label: "Pricing & ROI", icon: Tag },
    { key: "exclusions", label: "Exclusions & Docs", icon: ShieldAlert },
    { key: "sources", label: "Source Excerpts", icon: BookOpen, badge: sources.length || undefined },
    { key: "extra", label: "Additional Points", icon: ListPlus, badge: extraPoints.length || undefined },
  ]

  return (
    <div className="w-full min-w-0 space-y-6 text-slate-100">
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
        {sectionsList.map((sec) => {
          const Icon = sec.icon
          const isActive = activeSection === sec.key
          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
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
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full border",
                    sec.key === "interpretations"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                  )}
                >
                  {sec.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="bg-slate-900/60 rounded-xl border border-white/10 p-5 space-y-4 min-w-0">
        {/* INTERPRETATIONS — ambiguous / Hinglish source text the AI had to interpret.
            Left-side pencil icon toggles inline editing per card instead of accept/reject. */}
        {activeSection === "interpretations" && (
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-sky-400" /> Interpretations
              </h3>
              <span className="text-xs text-slate-400">
                {interpretations.length} {interpretations.length === 1 ? "item" : "items"}
              </span>
            </div>

            {interpretations.length === 0 ? (
              <EmptyNote text="No ambiguous or Hinglish text needed interpretation for this document." />
            ) : (
              <div className="space-y-3">
                {interpretations.map((rawItem, i) => {
                  const item = obj(rawItem)
                  const confidence = str(item.confidence)
                  const confidenceStyle =
                    confidence === "high"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : confidence === "medium"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  const isEditing = editingIndexes.has(i)

                  return (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-white/10 bg-slate-950/80 flex gap-3 min-w-0"
                    >
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wide text-sky-400">
                            {str(item.targetField) || "unknown field"}
                          </span>
                          {confidence && (
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", confidenceStyle)}>
                              {confidence} confidence
                            </span>
                          )}
                        </div>

                        <div className="w-full min-w-0">
                          <Label className="text-[10px] text-slate-500 uppercase tracking-wide">
                            User Prompt
                          </Label>
                          {isEditing ? (
                            <Textarea
                              value={str(item.sourcePhrase)}
                              onChange={(e) => setInterpretationPrompt(i, e.target.value)}
                              className="bg-slate-900 border-slate-800 text-xs mt-1.5 min-h-[50px] w-full"
                            />
                          ) : (
                            <p className="text-xs text-slate-300 italic mt-1.5 leading-relaxed break-words bg-slate-900/70 p-2.5 rounded-lg border border-white/5 w-full">
                              &ldquo;{str(item.sourcePhrase)}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="w-full min-w-0">
                          <Label className="text-[10px] text-slate-500 uppercase tracking-wide">
                            AI Recommendation
                          </Label>
                          {isEditing ? (
                            <Textarea
                              value={str(item.suggestedInterpretation)}
                              onChange={(e) => setInterpretationText(i, e.target.value)}
                              className="bg-slate-900 border-slate-800 text-xs mt-1.5 min-h-[60px] w-full"
                            />
                          ) : (
                            <p className="text-xs text-slate-100 mt-1.5 leading-relaxed break-words bg-slate-900/40 p-2.5 rounded-lg border border-white/5 w-full">
                              {str(item.suggestedInterpretation)}
                            </p>
                          )}
                        </div>
                      </div>

                      {!readOnly && (
                        <button
                          onClick={() => toggleEditing(i)}
                          className={cn(
                            "shrink-0 h-7 w-7 rounded-lg border flex items-center justify-center transition-colors mt-0.5",
                            isEditing
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                          )}
                          title={isEditing ? "Done editing" : "Edit"}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ELIGIBILITY — generic render of eligibility.* plus comparison.* (headline numbers
            sometimes land in "comparison" instead of "eligibility" depending on extraction run) */}
        {activeSection === "eligibility" && (
          <div className="space-y-5 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Eligibility Parameters
            </h3>

            {readOnly && !eligibilityHasData ? (
              <EmptyNote text="No eligibility rules were extracted from this document." />
            ) : (
              <>
                {(!readOnly || sectionHasAnyData(comparison)) && (
                  <GenericObjectSection
                    title="Headline Criteria"
                    obj={comparison}
                    basePath="comparison"
                    readOnly={readOnly}
                    setPath={setPath}
                    setArrayPath={setArrayPath}
                  />
                )}
                {(!readOnly || sectionHasAnyData(eligibility)) && (
                  <GenericObjectSection
                    title="Additional Eligibility Fields"
                    obj={eligibility}
                    basePath="eligibility"
                    readOnly={readOnly}
                    setPath={setPath}
                    setArrayPath={setArrayPath}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* FOIR — fully generic */}
        {activeSection === "foir" && (
          <div className="space-y-4 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" /> FOIR & Obligation Rules
            </h3>

            {readOnly && !foirHasData ? (
              <EmptyNote text="No FOIR rules were extracted from this document." />
            ) : (
              <GenericObjectSection
                obj={foir}
                basePath="foir"
                readOnly={readOnly}
                setPath={setPath}
                setArrayPath={setArrayPath}
              />
            )}
          </div>
        )}

        {/* LIMITS & TENURE — generic across loan_limits, tenure, ltv */}
        {activeSection === "limits" && (
          <div className="space-y-6 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" /> Loan Limits, LTV & Tenure
            </h3>

            {readOnly && !limitsHasData ? (
              <EmptyNote text="No loan limit or tenure rules were extracted from this document." />
            ) : (
              <>
                {(!readOnly || sectionHasAnyData(loanLimits)) && (
                  <GenericObjectSection title="Loan Limits" obj={loanLimits} basePath="loan_limits" readOnly={readOnly} setPath={setPath} setArrayPath={setArrayPath} />
                )}
                {(!readOnly || sectionHasAnyData(tenure)) && (
                  <GenericObjectSection title="Tenure" obj={tenure} basePath="tenure" readOnly={readOnly} setPath={setPath} setArrayPath={setArrayPath} />
                )}
                {(!readOnly || sectionHasAnyData(ltv)) && (
                  <GenericObjectSection title="LTV" obj={ltv} basePath="ltv" readOnly={readOnly} setPath={setPath} setArrayPath={setArrayPath} />
                )}
              </>
            )}
          </div>
        )}

        {/* PRICING — generic */}
        {activeSection === "pricing" && (
          <div className="space-y-4 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" /> Pricing & ROI
            </h3>

            {readOnly && !pricingHasData ? (
              <EmptyNote text="No pricing details were extracted from this document." />
            ) : (
              <>
                <GenericObjectSection obj={pricing} basePath="pricing" readOnly={readOnly} setPath={setPath} setArrayPath={setArrayPath} />
                {(!readOnly || hasValue(formData.notes)) && (
                  <ValueField label="General Notes" value={formData.notes} onChange={(v: any) => setPath("notes", v)} readOnly={readOnly} kind="notes" />
                )}
              </>
            )}
          </div>
        )}

        {/* EXCLUSIONS & DOCS */}
        {activeSection === "exclusions" && (
          <div className="space-y-5 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Exclusions & Required Documents
            </h3>

            {readOnly && !exclusionsHasData ? (
              <EmptyNote text="No exclusions, documents, or products were extracted from this document." />
            ) : (
              <>
                {(!readOnly || exclusions.length > 0) && (
                  <TagListField label={`Ineligible / Excluded Profiles${exclusions.length > 0 ? ` (${exclusions.length})` : ""}`} items={exclusions} readOnly={readOnly} onChange={(next: any) => setArrayPath("exclusions", next)} />
                )}
                {(!readOnly || documentsRequired.length > 0) && (
                  <TagListField label={`Documents Required${documentsRequired.length > 0 ? ` (${documentsRequired.length})` : ""}`} items={documentsRequired} readOnly={readOnly} onChange={(next: any) => setArrayPath("documents_required", next)} />
                )}
                {(!readOnly || detectedProducts.length > 0) && (
                  <TagListField label="Detected Products" items={detectedProducts} readOnly={readOnly} onChange={(next: any) => setPath("detected_products", next)} />
                )}
              </>
            )}
          </div>
        )}

        {/* SOURCES */}
        {activeSection === "sources" && (
          <div className="space-y-3 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Source Excerpts {sources.length > 0 && `(${sources.length})`}
            </h3>
            {sources.length === 0 && <EmptyNote text="No source excerpts recorded." />}
            <div className="space-y-2">
              {sources.map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-white/10 bg-slate-950/70 space-y-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wide text-emerald-400">
                    {str(s.section) || `Section ${i + 1}`}
                  </span>
                  <p className="text-xs text-slate-300 italic leading-relaxed break-words">
                    &ldquo;{str(s.excerpt)}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADDITIONAL POINTS */}
        {activeSection === "extra" && (
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-emerald-400" /> Additional Points {extraPoints.length > 0 && `(${extraPoints.length})`}
              </h3>
              {!readOnly && <p className="text-xs text-slate-500">For anything the AI missed or that doesn't fit above</p>}
            </div>

            {readOnly && extraPoints.length === 0 ? (
              <EmptyNote text="No additional points were added for this document." />
            ) : (
              <ListField
                items={extraPoints}
                readOnly={readOnly}
                onUpdate={(i: number, v: string) => updateStringArrayItem("extra_points", i, v)}
                onRemove={(i: number) => removeStringArrayItem("extra_points", i)}
                onAdd={() => addStringArrayItem("extra_points")}
                hideLabel
              />
            )}
          </div>
        )}
      </div>

      {/* SAVE BAR — explicit, separate from Approve. Editing only ever
          touches local state until this is clicked; Approve (in the
          parent page) stays a distinct, final, locking action. */}
      {!readOnly && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
          <div className="text-xs">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Unsaved changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                All changes saved
              </span>
            )}
            {saveError && <span className="ml-3 text-red-400">{saveError}</span>}
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-linear-to-r from-primary to-indigo-500 w-full sm:w-auto"
            onClick={handleSaveChanges}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

// =========================================================================
// Generic section renderer — walks whatever keys actually exist in an
// object (scalars, string-arrays, or arrays-of-objects) and renders them,
// instead of assuming fixed field names. This is what makes the UI
// resilient to naming drift between different extraction runs.
// =========================================================================
function GenericObjectSection({
  title,
  obj: sectionObj,
  basePath,
  readOnly,
  setPath,
  setArrayPath,
}: {
  title?: string
  obj: Record<string, any>
  basePath: string
  readOnly: boolean
  setPath: (path: string, value: any) => void
  setArrayPath: (path: string, arr: any[]) => void
}) {
  const entries = Object.entries(sectionObj)
  const scalarEntries = entries.filter(([, v]) => isScalar(v))
  const stringArrayEntries = entries.filter(([, v]) => isArr(v) && v.every((x: any) => isScalar(x)))
  const objectArrayEntries = entries.filter(([, v]) => isArr(v) && v.some((x: any) => isObj(x)))

  const visibleScalars = readOnly ? scalarEntries.filter(([, v]) => hasValue(v)) : scalarEntries
  const visibleStringArrays = readOnly ? stringArrayEntries.filter(([, v]) => v.length > 0) : stringArrayEntries
  const visibleObjectArrays = readOnly ? objectArrayEntries.filter(([, v]) => v.length > 0) : objectArrayEntries

  if (visibleScalars.length === 0 && visibleStringArrays.length === 0 && visibleObjectArrays.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 min-w-0">
      {title && <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{title}</Label>}

      {visibleScalars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleScalars.map(([key, value]) => (
            <ValueField
              key={key}
              label={prettyLabel(key)}
              value={value}
              readOnly={readOnly}
              kind={typeof value === "number" ? "num" : "text"}
              onChange={(v: any) => setPath(`${basePath}.${key}`, v)}
            />
          ))}
        </div>
      )}

      {visibleStringArrays.map(([key, value]) => (
        <TagListField
          key={key}
          label={`${prettyLabel(key)}${value.length > 0 ? ` (${value.length})` : ""}`}
          items={value}
          readOnly={readOnly}
          onChange={(next: any) => setArrayPath(`${basePath}.${key}`, next)}
        />
      ))}

      {visibleObjectArrays.map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label className="text-xs text-slate-400">{prettyLabel(key)} {value.length > 0 && `(${value.length})`}</Label>
          <div className="space-y-2">
            {value.map((item: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-white/10 bg-slate-950/70 flex flex-wrap gap-3 min-w-0">
                {Object.entries(item).map(([itemKey, itemVal]) => {
                  if (readOnly && !hasValue(itemVal)) return null
                  return (
                    <div key={itemKey} className="min-w-0 flex-1">
                      <Label className="text-[10px] text-slate-500 capitalize">{prettyLabel(itemKey)}</Label>
                      {readOnly ? (
                        <p className="text-xs text-slate-200 mt-0.5">{str(itemVal)}</p>
                      ) : (
                        <Input
                          value={str(itemVal)}
                          onChange={(e) => {
                            const v = e.target.value
                            const current = value as any[]
                            const nextArr = current.map((it, idx) =>
                              idx === i ? { ...it, [itemKey]: isNaN(Number(v)) || v === "" ? v : Number(v) } : it
                            )
                            setArrayPath(`${basePath}.${key}`, nextArr)
                          }}
                          className="bg-slate-900 border-slate-800 text-xs mt-0.5 h-8 w-full"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// =========================================================================
function ValueField({
  label,
  value,
  onChange,
  readOnly,
  kind,
}: {
  label: string
  value: any
  onChange: (v: any) => void
  readOnly: boolean
  kind: "text" | "num" | "notes"
}) {
  if (readOnly) {
    if (!hasValue(value)) return null
    return (
      <div className="min-w-0">
        <Label className="text-xs text-slate-400">{label}</Label>
        <p className="text-sm text-slate-100 mt-1 leading-relaxed break-words">{str(value)}</p>
      </div>
    )
  }

  if (kind === "notes") {
    return (
      <div className="min-w-0">
        <Label className="text-xs text-slate-400">{label}</Label>
        <Textarea
          value={str(value)}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-950 border-slate-800 text-xs mt-1 min-h-[70px] w-full"
        />
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <Label className="text-xs text-slate-400">{label}</Label>
      <Input
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => {
          const v = e.target.value
          if (kind === "num") {
            onChange(v === "" ? null : isNaN(Number(v)) ? v : Number(v))
          } else {
            onChange(v)
          }
        }}
        className="bg-slate-950 border-slate-800 text-xs mt-1 w-full"
      />
    </div>
  )
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-slate-950/40 text-slate-500 text-xs">
      <Info className="w-3.5 h-3.5 shrink-0" /> {text}
    </div>
  )
}

function TagListField({ label, items, onChange, readOnly }: any) {
  const [draft, setDraft] = useState("")
  const removeAt = (i: number) => onChange(items.filter((_: any, idx: number) => idx !== i))
  const addDraft = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...items, v])
    setDraft("")
  }

  if (readOnly && items.length === 0) return null

  return (
    <div className="min-w-0">
      <Label className="text-xs text-slate-400">{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.length === 0 && !readOnly && <span className="text-xs text-slate-500">Not extracted</span>}
        {items.map((tag: string, i: number) => (
          <span key={i} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-200 text-xs px-2.5 py-1 rounded-full max-w-full">
            <span className="truncate max-w-[220px]">{str(tag)}</span>
            {!readOnly && (
              <button onClick={() => removeAt(i)} className="text-slate-400 hover:text-rose-400 shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!readOnly && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDraft())}
            className="bg-slate-950 border-slate-800 text-xs h-8"
          />
          <Button size="sm" variant="outline" className="h-8 text-xs border-slate-700 bg-slate-800 shrink-0" onClick={addDraft}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
      )}
    </div>
  )
}

function ListField({ items, onUpdate, onRemove, onAdd, readOnly, hideLabel }: any) {
  if (readOnly) {
    if (items.length === 0) return null
    return (
      <div className="space-y-2">
        {items.map((item: string, i: number) => (
          <p key={i} className="text-sm text-slate-100 leading-relaxed break-words p-3 rounded-lg border border-white/5 bg-slate-950/50">
            {item}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" className={cn("h-7 text-xs border-slate-700 bg-slate-800", hideLabel && "ml-auto")} onClick={onAdd}>
          <Plus className="w-3 h-3 mr-1" /> Add Point
        </Button>
      </div>
      {items.length === 0 && <EmptyNote text="None added yet." />}
      <div className="space-y-2">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex items-start gap-2 min-w-0">
            <Textarea
              value={item}
              onChange={(e) => onUpdate(i, e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs min-h-[50px] flex-1"
            />
            <button onClick={() => onRemove(i)} className="text-rose-400 hover:text-rose-300 shrink-0 p-1.5 mt-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}