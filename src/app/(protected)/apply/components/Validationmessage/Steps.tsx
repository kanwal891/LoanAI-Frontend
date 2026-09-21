"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  Plus,
  Trash2,
  Banknote,
  Building2,
  Percent,
  User,
  Calendar,
  MapPin,
  Wallet,
  Briefcase,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { FloatingInput } from "@/components/floating-input"
import { FloatingSelect } from "@/components/floating-select"
import { SegmentedToggle } from "@/components/segmented-toggle"
import {
  stripNegative,
  emptyExistingLoan,
  loanTypeOptions,
  expectedLoanTypeOptions,
  companyTypeOptions,
  salaryCreditOptions,
  incentiveFrequencyOptions,
  professionTypeOptions,
  govtGradeOptions,
  locationOptions,
  type ExistingLoan,
  type StepProps,
} from "../../form"

const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

function clampMaxNumberString(value: string, max: number): string {
  const stripped = stripNegative(value)
  if (stripped.trim() === "") return stripped
  const n = Number(stripped)
  if (Number.isNaN(n)) return stripped
  return n > max ? String(max) : stripped
}

// Helper for unique key generation
function generateUniqueId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function ExistingLoanCard({
  loan,
  index,
  canDelete,
  onRemove,
  onChange,
}: {
  loan: ExistingLoan
  index: number
  canDelete: boolean
  onRemove: () => void
  onChange: <K extends keyof ExistingLoan>(field: K, value: ExistingLoan[K]) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 rounded-xl glass border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">Loan {index + 1}</h3>
        {canDelete && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
            aria-label={`Delete Loan ${index + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FloatingSelect
          label="Type of Loan"
          options={loanTypeOptions}
          value={loan.type}
          onChange={(v) => onChange("type", v)}
        />
        <FloatingInput
          label="Loan Amount Outstanding"
          value={loan.amount}
          onChange={(v) => onChange("amount", stripNegative(v))}
          icon={<Banknote className="w-5 h-5" />}
        />
        <FloatingInput
          label="Current Bank Name"
          value={loan.bankName}
          onChange={(v) => onChange("bankName", v)}
          icon={<Building2 className="w-5 h-5" />}
        />
        <FloatingInput
          label="Current Rate of Interest (%)"
          value={loan.interestRate}
          onChange={(v) => onChange("interestRate", stripNegative(v))}
          icon={<Percent className="w-5 h-5" />}
        />
        <FloatingInput
          label="Loan Disbursement Date"
          value={loan.startDate}
          onChange={(v) => onChange("startDate", v)}
          placeholder="DD/MM/YYYY"
          showCalendar
        />
        <FloatingInput
          label="Current EMI"
          value={loan.currentEMI}
          onChange={(v) => onChange("currentEMI", stripNegative(v))}
          prefix="₹"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Foreclosure Available</label>
          <SegmentedToggle
            options={yesNo}
            value={loan.foreclosureAvailable}
            onChange={(v) => onChange("foreclosureAvailable", v)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Any EMI Bounce</label>
          <SegmentedToggle options={yesNo} value={loan.emiBounce} onChange={(v) => onChange("emiBounce", v)} />
        </div>
      </div>
    </motion.div>
  )
}

function ProfessionDropdown({ form, update }: StepProps) {
  const [open, setOpen] = useState(false)
  const [govtExpanded, setGovtExpanded] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    function updatePosition() {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (open) setGovtExpanded(form.professionType === "govt-employee")
  }, [open, form.professionType])

  const isGovtEmployee = form.professionType === "govt-employee"
  const selectedGrade = govtGradeOptions.find((g) => g.value === form.govtGrade)

  const triggerLabel = isGovtEmployee
    ? selectedGrade
      ? `Government Employee — ${selectedGrade.label}`
      : "Government Employee"
    : professionTypeOptions.find((p) => p.value === form.professionType)?.label || ""

  const selectProfession = (value: string) => {
    update("professionType", value)
    if (value === "govt-employee") {
      setGovtExpanded(true)
      return
    }
    update("govtGrade", "")
    update("govtGradeDescription", "")
    setOpen(false)
    setGovtExpanded(false)
  }

  const selectGrade = (grade: string) => {
    update("professionType", "govt-employee")
    update("govtGrade", grade)
    setOpen(false)
    setGovtExpanded(false)
  }

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            zIndex: 100,
            maxHeight: "min(320px, calc(100vh - " + menuPos.top + "px - 16px))",
          }}
          className="rounded-xl border border-white/10 bg-[#0B1220] shadow-xl overflow-y-auto overscroll-contain"
        >
          {professionTypeOptions.map((opt) => {
            const isGovtRow = opt.value === "govt-employee"
            return (
              <div key={opt.value}>
                <button
                  type="button"
                  onClick={() => (isGovtRow ? setGovtExpanded((v) => !v) : selectProfession(opt.value))}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors ${
                    form.professionType === opt.value ? "text-white bg-white/5" : "text-muted-foreground"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isGovtRow && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${govtExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {isGovtRow && (
                  <AnimatePresence initial={false}>
                    {govtExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden bg-black/20"
                      >
                        {govtGradeOptions.map((grade) => (
                          <button
                            key={grade.value}
                            type="button"
                            onClick={() => selectGrade(grade.value)}
                            className={`w-full pl-8 pr-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors ${
                              form.govtGrade === grade.value ? "text-white bg-white/5" : "text-muted-foreground"
                            }`}
                          >
                            {grade.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 rounded-xl glass border border-white/10 hover:border-white/20 transition-colors text-left"
      >
        <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <span className={`flex-1 text-sm font-medium ${triggerLabel ? "text-white" : "text-muted-foreground"}`}>
          {triggerLabel || "Select profession"}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && createPortal(menu, document.body)}
    </div>
  )
}

function RadioGroup({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  size?: "sm" | "md"
}) {
  const isSm = size === "sm"
  return (
    <div className={`flex flex-wrap ${isSm ? "gap-2" : "gap-3"}`}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <label
            key={opt.value}
            className={`flex items-center justify-center cursor-pointer rounded-lg border transition-colors ${
              isSm ? "gap-1.5 px-3 py-1.5" : "flex-1 min-w-[140px] gap-2.5 px-6 py-3.5 rounded-xl"
            } ${selected ? "border-[#1B4FBB]/60 bg-[#1B4FBB]/10" : "border-white/10 hover:border-white/20"}`}
          >
            <span
              className={`flex items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                isSm ? "w-3 h-3" : "w-4 h-4"
              } ${selected ? "border-[#6366F1]" : "border-white/30"}`}
            >
              {selected && <span className={`rounded-full bg-[#6366F1] ${isSm ? "w-1.5 h-1.5" : "w-2 h-2"}`} />}
            </span>
            <input
              type="radio"
              className="sr-only"
              checked={selected}
              onChange={() => onChange(opt.value)}
            />
            <span className={`${isSm ? "text-xs" : "text-sm"} ${selected ? "text-white" : "text-muted-foreground"}`}>
              {opt.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}

// =========================================================================
// Step 1 — Personal Details
// =========================================================================

export function PersonalDetailsStep({ form, update }: StepProps) {
  const isGovtEmployee = form.professionType === "govt-employee"

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FloatingInput
          label="Full Name"
          value={form.name}
          onChange={(v) => update("name", v)}
          icon={<User className="w-5 h-5" />}
        />
        <FloatingInput
          label="Age"
          type="number"
          value={form.age}
          onChange={(v) => update("age", clampMaxNumberString(v, 80))}
          min={18}
          max={80}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:items-center">
        <FloatingInput
          label="Pincode"
          value={form.pincode}
          onChange={(v) => update("pincode", v)}
          icon={<MapPin className="w-5 h-5" />}
        />

        <div className="flex items-center gap-6">
          <label className="text-s text-[#ededf3] px-1 flex-shrink-0">Location</label>
          <RadioGroup size="sm" options={locationOptions} value={form.location} onChange={(v) => update("location", v)} />
        </div>
      </div>

      <ProfessionDropdown form={form} update={update} />

      <AnimatePresence>
        {isGovtEmployee && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FloatingInput
              label="Description (optional)"
              value={form.govtGradeDescription}
              onChange={(v) => update("govtGradeDescription", v)}
              placeholder="Any additional details, if required"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className="text-sm text-muted-foreground mb-3 block">Loan Type</label>
        <SegmentedToggle
          options={[
            { value: "fresh", label: "Fresh Case", description: "New loan application" },
            { value: "bt", label: "Balance Transfer", description: "Transfer existing loans" },
          ]}
          value={form.caseType}
          onChange={(v) => update("caseType", v)}
        />
      </div>
    </div>
  )
}

// =========================================================================
// Step 2 — Loan Details
// =========================================================================

export function LoanDetailsStep({ form, update }: StepProps) {
  const isBT = form.caseType === "bt"

  const addExistingLoan = () => {
    update("existingLoans", [...form.existingLoans, emptyExistingLoan(generateUniqueId())])
  }

  const removeExistingLoan = (id: string) => {
    if (form.existingLoans.length > 1) {
      update("existingLoans", form.existingLoans.filter((loan) => loan.id !== id))
    }
  }

  const updateExistingLoan = <K extends keyof ExistingLoan>(id: string, field: K, value: ExistingLoan[K]) => {
    update(
      "existingLoans",
      form.existingLoans.map((loan) => (loan.id === id ? { ...loan, [field]: value } : loan))
    )
  }

  const addFreshExistingLoan = () => {
    update("existingLoansFresh", [...form.existingLoansFresh, emptyExistingLoan(generateUniqueId())])
  }

  const removeFreshExistingLoan = (id: string) => {
    if (form.existingLoansFresh.length > 1) {
      update("existingLoansFresh", form.existingLoansFresh.filter((loan) => loan.id !== id))
    }
  }

  const updateFreshExistingLoan = <K extends keyof ExistingLoan>(id: string, field: K, value: ExistingLoan[K]) => {
    update(
      "existingLoansFresh",
      form.existingLoansFresh.map((loan) => (loan.id === id ? { ...loan, [field]: value } : loan))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {isBT
            ? "Enter your current loan information for balance transfer"
            : "Tell us about your loan requirements"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isBT ? (
          <motion.div
            key="bt"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            {form.existingLoans.map((loan, index) => (
              <ExistingLoanCard
                key={loan.id}
                loan={loan}
                index={index}
                canDelete={form.existingLoans.length > 1}
                onRemove={() => removeExistingLoan(loan.id)}
                onChange={(field, value) => updateExistingLoan(loan.id, field, value)}
              />
            ))}

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={addExistingLoan}
              className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-[#1B4FBB] text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add More Loan
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="fresh"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <FloatingSelect
                label="Expected Type of Loan"
                options={expectedLoanTypeOptions}
                value={form.expectedLoanType}
                onChange={(v) => update("expectedLoanType", v)}
              />
              <FloatingInput
                label="Principal Amount Required"
                value={form.expectedPrincipal}
                onChange={(v) => update("expectedPrincipal", stripNegative(v))}
                prefix="₹"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-3 block">Do you have an existing loan?</label>
              <SegmentedToggle
                options={yesNo}
                value={form.hasExistingLoan}
                onChange={(v) => update("hasExistingLoan", v)}
              />
            </div>

            <AnimatePresence>
              {form.hasExistingLoan === "yes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  {form.existingLoansFresh.map((loan, index) => (
                    <ExistingLoanCard
                      key={loan.id}
                      loan={loan}
                      index={index}
                      canDelete={form.existingLoansFresh.length > 1}
                      onRemove={() => removeFreshExistingLoan(loan.id)}
                      onChange={(field, value) => updateFreshExistingLoan(loan.id, field, value)}
                    />
                  ))}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={addFreshExistingLoan}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-[#1B4FBB] text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add More Loan
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =========================================================================
// Step 3 — Company Details
// =========================================================================

export function CompanyDetailsStep({ form, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Tell us about your employment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FloatingSelect
          label="Type of Company"
          options={companyTypeOptions}
          value={form.companyType}
          onChange={(v) => update("companyType", v)}
          icon={<Building2 className="w-5 h-5" />}
        />
        <FloatingInput
          label="Company Name"
          value={form.companyName}
          onChange={(v) => update("companyName", v)}
          icon={<Building2 className="w-5 h-5" />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FloatingInput
          label="Age of Company (Years)"
          type="number"
          value={form.companyAge}
          onChange={(v) => update("companyAge", stripNegative(v))}
          icon={<Calendar className="w-5 h-5" />}
        />
        <FloatingSelect
          label="Salary Credit Type"
          options={salaryCreditOptions}
          value={form.salaryCreditType}
          onChange={(v) => update("salaryCreditType", v)}
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>
    </div>
  )
}

// =========================================================================
// Step 4 — Credit History
// =========================================================================

export function CreditHistoryStep({ form, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Your credit history helps us find the best rates</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FloatingInput
          label="CIBIL Score"
          type="number"
          value={form.cibilScore}
          onChange={(v) => update("cibilScore", clampMaxNumberString(v, 900))}
          min={300}
          max={900}
          placeholder="300-900"
        />
        <FloatingInput
          label="Enquiries in Last 30 Days"
          type="number"
          value={form.enquiries30Days}
          onChange={(v) => update("enquiries30Days", stripNegative(v))}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Bounce in Latest Month</label>
          <SegmentedToggle options={yesNo} value={form.bounceLatest} onChange={(v) => update("bounceLatest", v)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Any Overdue Pending</label>
          <SegmentedToggle options={yesNo} value={form.overduePending} onChange={(v) => update("overduePending", v)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Past Delayed Payments</label>
          <SegmentedToggle options={yesNo} value={form.pastDelayed} onChange={(v) => update("pastDelayed", v)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Settlement / Write Off / Suit Filed</label>
          <SegmentedToggle
            options={yesNo}
            value={form.settlementWriteOff}
            onChange={(v) => update("settlementWriteOff", v)}
          />
        </div>
      </div>

      <AnimatePresence>
        {form.settlementWriteOff === "yes" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FloatingInput
              label="Date of Settlement / Write Off"
              type="date"
              value={form.settlementDate}
              onChange={(v) => update("settlementDate", v)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =========================================================================
// Step 5 — Salary & Banking
// =========================================================================

export function SalaryBankingStep({ form, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Your income details for accurate recommendations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FloatingInput
          label="Fixed Salary Component"
          value={form.fixedSalary}
          onChange={(v) => update("fixedSalary", stripNegative(v))}
          icon={<Wallet className="w-5 h-5" />}
        />
        <FloatingInput
          label="Incentive / Variable Pay"
          value={form.incentive}
          onChange={(v) => update("incentive", stripNegative(v))}
          prefix="₹"
        />
      </div>

      <FloatingSelect
        label="Incentive Frequency"
        options={incentiveFrequencyOptions}
        value={form.incentiveFrequency}
        onChange={(v) => update("incentiveFrequency", v)}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">PF Deducted</label>
          <SegmentedToggle options={yesNo} value={form.pfDeducted} onChange={(v) => update("pfDeducted", v)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">TDS Deducted</label>
          <SegmentedToggle options={yesNo} value={form.tdsDeducted} onChange={(v) => update("tdsDeducted", v)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Official Mail ID Available</label>
          <SegmentedToggle
            options={yesNo}
            value={form.officialMailAvailable}
            onChange={(v) => update("officialMailAvailable", v)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Home Loan History / Running</label>
          <SegmentedToggle
            options={yesNo}
            value={form.homeLoanHistory}
            onChange={(v) => update("homeLoanHistory", v)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">26AS Available</label>
          <SegmentedToggle
            options={yesNo}
            value={form.form26ASAvailable}
            onChange={(v) => update("form26ASAvailable", v)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Form 16 Available</label>
          <SegmentedToggle
            options={yesNo}
            value={form.form16Available}
            onChange={(v) => update("form16Available", v)}
          />
        </div>
      </div>
    </div>
  )
}