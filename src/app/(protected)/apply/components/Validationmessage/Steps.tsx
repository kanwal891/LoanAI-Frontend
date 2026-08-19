"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Plus, Trash2, Banknote, Building2, Percent, User, Calendar, MapPin, Wallet } from "lucide-react"
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

// =========================================================================
// Step 1 — Personal Details
// =========================================================================

export function PersonalDetailsStep({ form, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Personal Details</h2>
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

      <FloatingInput
        label="Pincode"
        value={form.pincode}
        onChange={(v) => update("pincode", v)}
        icon={<MapPin className="w-5 h-5" />}
      />

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">
          {isBT ? "Existing Loan Details" : "Expected Loan Details"}
        </h2>
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
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 rounded-xl glass border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">Loan {index + 1}</h3>
                  {form.existingLoans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExistingLoan(loan.id)}
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
                    onChange={(v) => updateExistingLoan(loan.id, "type", v)}
                  />
                  <FloatingInput
                    label="Loan Amount Outstanding"
                    value={loan.amount}
                    onChange={(v) => updateExistingLoan(loan.id, "amount", stripNegative(v))}
                    icon={<Banknote className="w-5 h-5" />}
                  />
                  <FloatingInput
                    label="Current Bank Name"
                    value={loan.bankName}
                    onChange={(v) => updateExistingLoan(loan.id, "bankName", v)}
                    icon={<Building2 className="w-5 h-5" />}
                  />
                  <FloatingInput
                    label="Current Rate of Interest (%)"
                    value={loan.interestRate}
                    onChange={(v) => updateExistingLoan(loan.id, "interestRate", stripNegative(v))}
                    icon={<Percent className="w-5 h-5" />}
                  />
                  <FloatingInput
                    label="Loan Disbursement Date"
                    value={loan.startDate}
                    onChange={(v) => updateExistingLoan(loan.id, "startDate", v)}
                    placeholder="DD/MM/YYYY"
                    showCalendar
                  />
                  <FloatingInput
                    label="Principal Outstanding"
                    value={loan.principalOutstanding}
                    onChange={(v) => updateExistingLoan(loan.id, "principalOutstanding", stripNegative(v))}
                    prefix="₹"
                  />
                  <FloatingInput
                    label="Current EMI"
                    value={loan.currentEMI}
                    onChange={(v) => updateExistingLoan(loan.id, "currentEMI", stripNegative(v))}
                    prefix="₹"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Foreclosure Available</label>
                    <SegmentedToggle
                      options={yesNo}
                      value={loan.foreclosureAvailable}
                      onChange={(v) => updateExistingLoan(loan.id, "foreclosureAvailable", v)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Any EMI Bounce</label>
                    <SegmentedToggle
                      options={yesNo}
                      value={loan.emiBounce}
                      onChange={(v) => updateExistingLoan(loan.id, "emiBounce", v)}
                    />
                  </div>
                </div>
              </motion.div>
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
                label="Expected Rate of Interest (%)"
                value={form.expectedInterestRate}
                onChange={(v) => update("expectedInterestRate", stripNegative(v))}
                icon={<Percent className="w-5 h-5" />}
              />
              <FloatingInput
                label="Expected EMI"
                value={form.expectedEMI}
                onChange={(v) => update("expectedEMI", stripNegative(v))}
                icon={<Banknote className="w-5 h-5" />}
              />
              <FloatingInput
                label="Principal Amount Required"
                value={form.expectedPrincipal}
                onChange={(v) => update("expectedPrincipal", stripNegative(v))}
                prefix="₹"
              />
            </div>
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
        <h2 className="text-xl font-semibold text-white mb-1">Employment & Company Details</h2>
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
          label="Age of Company (Years)"
          type="number"
          value={form.companyAge}
          onChange={(v) => update("companyAge", stripNegative(v))}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      <FloatingSelect
        label="Salary Credit Type"
        options={salaryCreditOptions}
        value={form.salaryCreditType}
        onChange={(v) => update("salaryCreditType", v)}
        icon={<Wallet className="w-5 h-5" />}
      />
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
        <h2 className="text-xl font-semibold text-white mb-1">Credit Health Analysis</h2>
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
          label="Enquiries in Last 3 Months"
          type="number"
          value={form.enquiries}
          onChange={(v) => update("enquiries", stripNegative(v))}
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
        <h2 className="text-xl font-semibold text-white mb-1">Salary & Banking Information</h2>
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
      </div>
    </div>
  )
}