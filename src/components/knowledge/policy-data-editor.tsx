"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, X, Loader2, Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// -----------------------------------------------------------------------
// Friendly section titles for the known top-level keys the extraction
// service produces. Anything not in this map still renders (as a
// human-cased fallback title), so new fields never disappear.
// -----------------------------------------------------------------------
const SECTION_TITLES: Record<string, string> = {
  comparison: "Comparison Summary",
  eligibility: "Eligibility",
  foir: "FOIR Rules",
  loan_limits: "Loan Limits",
  tenure: "Tenure",
  pricing: "Pricing",
  ltv: "LTV",
  documents_required: "Documents Required",
  exclusions: "Exclusions",
  notes: "Notes",
  sources: "Sources",
  detected_products: "Detected Products",
}

function humanize(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

// Shared height for every input-like box (single fields, min/max halves,
// tag "add item" inputs) so rows line up regardless of label length or
// whether a field is a single input or a combined min/max pair.
const FIELD_HEIGHT = "h-10"

// -----------------------------------------------------------------------
// A single primitive field — string / number / null editable as text.
// Empty string is saved back as null so we don't invent values.
// -----------------------------------------------------------------------
function PrimitiveField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string
  value: string | number | null
  onChange: (value: string | number | null) => void
  readOnly?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground block leading-4">{label}</Label>
      <Input
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === "") return onChange(null)
          const asNum = Number(raw)
          onChange(!isNaN(asNum) && raw.trim() !== "" && /^-?\d*\.?\d+$/.test(raw) ? asNum : raw)
        }}
        readOnly={readOnly}
        placeholder="Not extracted"
        className={cn(FIELD_HEIGHT, "border-white/10 bg-white/5 text-sm placeholder:text-muted-foreground/40")}
      />
    </div>
  )
}

// -----------------------------------------------------------------------
// A combined Min/Max row for paired fields (age_min+age_max,
// cibil_min+cibil_max, etc.) — one label, two small inputs side by side,
// instead of two disconnected boxes.
// -----------------------------------------------------------------------
function MinMaxField({
  label,
  minValue,
  maxValue,
  onChangeMin,
  onChangeMax,
  readOnly,
}: {
  label: string
  minValue: string | number | null
  maxValue: string | number | null
  onChangeMin: (value: string | number | null) => void
  onChangeMax: (value: string | number | null) => void
  readOnly?: boolean
}) {
  const parse = (raw: string): string | number | null => {
    if (raw === "") return null
    const asNum = Number(raw)
    return !isNaN(asNum) && /^-?\d*\.?\d+$/.test(raw) ? asNum : raw
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={minValue === null || minValue === undefined ? "" : String(minValue)}
          onChange={(e) => onChangeMin(parse(e.target.value))}
          readOnly={readOnly}
          placeholder="Min"
          className="border-white/10 bg-white/5 text-sm h-9 placeholder:text-muted-foreground/40"
        />
        <span className="text-muted-foreground text-xs shrink-0">to</span>
        <Input
          value={maxValue === null || maxValue === undefined ? "" : String(maxValue)}
          onChange={(e) => onChangeMax(parse(e.target.value))}
          readOnly={readOnly}
          placeholder="Max"
          className="border-white/10 bg-white/5 text-sm h-9 placeholder:text-muted-foreground/40"
        />
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------
// A nested object (eligibility, foir, pricing, etc.) rendered as a
// collapsible card of primitive fields. Fields sharing a `_min`/`_max`
// suffix pair (e.g. age_min + age_max) collapse into one combined row.
// -----------------------------------------------------------------------
function ObjectSection({
  title,
  data,
  onChange,
  readOnly,
  defaultOpen = true,
}: {
  title: string
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  readOnly?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const keys = Object.keys(data)

  if (keys.length === 0) return null

  // Detect base_min / base_max pairs so they render as one combined row
  // instead of two separate boxes.
  const pairedBases = new Set<string>()
  const consumedKeys = new Set<string>()
  for (const key of keys) {
    if (key.endsWith("_min")) {
      const base = key.slice(0, -4)
      const maxKey = `${base}_max`
      if (keys.includes(maxKey)) {
        pairedBases.add(base)
        consumedKeys.add(key)
        consumedKeys.add(maxKey)
      }
    }
  }

  const remainingEntries = Object.entries(data).filter(([key]) => !consumedKeys.has(key))

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
          {Array.from(pairedBases).map((base) => (
            <MinMaxField
              key={base}
              label={humanize(base)}
              minValue={data[`${base}_min`]}
              maxValue={data[`${base}_max`]}
              onChangeMin={(v) => onChange({ ...data, [`${base}_min`]: v })}
              onChangeMax={(v) => onChange({ ...data, [`${base}_max`]: v })}
              readOnly={readOnly}
            />
          ))}
          {remainingEntries.map(([key, value]) => {
            if (isPlainObject(value)) {
              // rare nested-nested case — fall back to a compact JSON display, not editable
              return (
                <div key={key} className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{humanize(key)}</Label>
                  <pre className="text-xs text-muted-foreground bg-black/20 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              )
            }
            if (Array.isArray(value)) {
              return (
                <div key={key} className="sm:col-span-2 lg:col-span-3">
                  <TagListField
                    label={humanize(key)}
                    items={value.map(String)}
                    onChange={(items) => onChange({ ...data, [key]: items })}
                    readOnly={readOnly}
                  />
                </div>
              )
            }
            return (
              <PrimitiveField
                key={key}
                label={humanize(key)}
                value={value}
                onChange={(v) => onChange({ ...data, [key]: v })}
                readOnly={readOnly}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------
// Array of strings (documents_required, exclusions, detected_products)
// rendered as removable tags with an add-new input.
// -----------------------------------------------------------------------
function TagListField({
  label,
  items,
  onChange,
  readOnly,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  readOnly?: boolean
}) {
  const [draft, setDraft] = useState("")

  const addItem = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setDraft("")
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground/60 italic">None listed</span>
        )}
        {items.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white"
          >
            {item}
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="text-muted-foreground hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!readOnly && (
        <div className="flex gap-2 mt-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem()
              }
            }}
            placeholder="Add item..."
            className="border-white/10 bg-white/5 text-sm h-8"
          />
          <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5 px-2" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------
// Sources — array of {section, excerpt} shown as small read-only citations
// -----------------------------------------------------------------------
function SourcesList({ sources }: { sources: any[] }) {
  if (!Array.isArray(sources) || sources.length === 0) return null
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium text-white mb-3">Sources</p>
      <div className="space-y-2">
        {sources.map((src, idx) => (
          <div key={idx} className="text-xs rounded-lg bg-black/20 p-3">
            {src.section && (
              <p className="text-muted-foreground font-medium mb-1">{src.section}</p>
            )}
            {src.excerpt && <p className="text-muted-foreground/80 italic">"{src.excerpt}"</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------
// Main editor
// -----------------------------------------------------------------------
interface PolicyDataEditorProps {
  data: Record<string, any>
  readOnly?: boolean
  onSave: (data: Record<string, any>) => Promise<void>
}

// Sections rendered specially / at the top, in this order.
// Everything else in `data` still renders, just below these.
const PRIORITY_SECTIONS = ["comparison", "eligibility", "foir", "pricing", "ltv", "loan_limits", "tenure"]
const TAG_LIST_KEYS = ["documents_required", "exclusions", "detected_products"]

export function PolicyDataEditor({ data, readOnly, onSave }: PolicyDataEditorProps) {
  const [local, setLocal] = useState<Record<string, any>>(data)
  const [isSaving, setIsSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setLocal(data)
  }, [data])

  const updateSection = (key: string, value: any) => {
    setLocal((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(local)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const knownKeys = new Set([...PRIORITY_SECTIONS, ...TAG_LIST_KEYS, "notes", "sources", "document_type"])
  const otherKeys = Object.keys(local).filter((k) => !knownKeys.has(k))

  return (
    <div className="space-y-4">
      {TAG_LIST_KEYS.filter((k) => Array.isArray(local[k])).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
          {TAG_LIST_KEYS.map((key) =>
            Array.isArray(local[key]) ? (
              <TagListField
                key={key}
                label={SECTION_TITLES[key] ?? humanize(key)}
                items={local[key]}
                onChange={(items) => updateSection(key, items)}
                readOnly={readOnly}
              />
            ) : null
          )}
        </div>
      )}

      {PRIORITY_SECTIONS.filter((k) => isPlainObject(local[k])).map((key) => (
        <ObjectSection
          key={key}
          title={SECTION_TITLES[key] ?? humanize(key)}
          data={local[key]}
          onChange={(value) => updateSection(key, value)}
          readOnly={readOnly}
          defaultOpen={key === "comparison" || key === "eligibility"}
        />
      ))}

      {otherKeys
        .filter((k) => isPlainObject(local[k]))
        .map((key) => (
          <ObjectSection
            key={key}
            title={SECTION_TITLES[key] ?? humanize(key)}
            data={local[key]}
            onChange={(value) => updateSection(key, value)}
            readOnly={readOnly}
            defaultOpen={false}
          />
        ))}

      {typeof local.notes === "string" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea
            value={local.notes}
            onChange={(e) => updateSection("notes", e.target.value)}
            readOnly={readOnly}
            className="border-white/10 bg-white/5 text-sm min-h-20"
          />
        </div>
      )}

      <SourcesList sources={local.sources} />

      {!readOnly && (
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            Save changes
          </Button>
          {savedFlash && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>
      )}
    </div>
  )
}