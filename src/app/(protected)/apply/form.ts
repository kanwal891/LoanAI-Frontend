import {
  type LoanApplicationRequest,
  type ExistingLoan as ApiExistingLoan,
  type ExistingLoanType,
  type ExpectedLoanType,
  type CompanyType,
  type SalaryCreditType,
  type IncentiveFrequency,
} from "@/lib/userAPI"

// =========================================================================
// TYPES
// =========================================================================

export interface ExistingLoan {
  id: string
  type: string
  amount: string
  bankName: string
  interestRate: string
  startDate: string
  principalOutstanding: string
  foreclosureAvailable: string
  currentEMI: string
  emiBounce: string
}

export const emptyExistingLoan = (id: string): ExistingLoan => ({
  id,
  type: "",
  amount: "",
  bankName: "",
  interestRate: "",
  startDate: "",
  principalOutstanding: "",
  foreclosureAvailable: "no",
  currentEMI: "",
  emiBounce: "no",
})

// -------------------------------------------------------------------------
// All form state lives in one object so it can be passed to step
// components as a single `form` + `update` pair instead of ~25 props.
// -------------------------------------------------------------------------
export interface ApplyFormState {
  // Step 1: Personal Details
  name: string
  age: string
  pincode: string
  caseType: string

  // Step 2A: Balance Transfer
  existingLoans: ExistingLoan[]

  // Step 2B: Fresh Case
  expectedLoanType: string
  expectedInterestRate: string
  expectedEMI: string
  expectedPrincipal: string

  // Step 3: Company Details
  companyType: string
  companyAge: string
  salaryCreditType: string

  // Step 4: CIBIL & Credit
  cibilScore: string
  enquiries: string
  bounceLatest: string
  overduePending: string
  pastDelayed: string
  settlementWriteOff: string
  settlementDate: string

  // Step 5: Salary & Banking
  fixedSalary: string
  incentive: string
  incentiveFrequency: string
  pfDeducted: string
  tdsDeducted: string
  officialMailAvailable: string
  homeLoanHistory: string
}

export const initialApplyFormState: ApplyFormState = {
  name: "",
  age: "",
  pincode: "",
  caseType: "fresh",

  existingLoans: [emptyExistingLoan("1")],

  expectedLoanType: "",
  expectedInterestRate: "",
  expectedEMI: "",
  expectedPrincipal: "",

  companyType: "",
  companyAge: "",
  salaryCreditType: "",

  cibilScore: "",
  enquiries: "",
  bounceLatest: "no",
  overduePending: "no",
  pastDelayed: "no",
  settlementWriteOff: "no",
  settlementDate: "",

  fixedSalary: "",
  incentive: "",
  incentiveFrequency: "",
  pfDeducted: "no",
  tdsDeducted: "no",
  officialMailAvailable: "no",
  homeLoanHistory: "no",
}

/** Standard shape every step component receives. */
export interface StepProps {
  form: ApplyFormState
  update: <K extends keyof ApplyFormState>(field: K, value: ApplyFormState[K]) => void
}

// =========================================================================
// CONSTANTS (option lists + FE -> API enum mapping tables)
// =========================================================================

export interface StepDef {
  id: number
  title: string
}

export const stepDefs: StepDef[] = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Loan Details" },
  { id: 3, title: "Company Details" },
  { id: 4, title: "Credit History" },
  { id: 5, title: "Salary & Banking" },
]

export const loanTypeOptions = [
  { value: "od", label: "Overdraft (OD)" },
  { value: "credit-card", label: "Credit Card" },
  { value: "app-loan", label: "App Loan" },
  { value: "personal-loan", label: "Personal Loan" },
]

export const companyTypeOptions = [
  { value: "pvt-ltd", label: "Pvt Ltd" },
  { value: "govt", label: "Govt Company" },
  { value: "llp", label: "LLP" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "school", label: "School" },
  { value: "trust", label: "Trust" },
  { value: "ngo", label: "NGO" },
  { value: "contract", label: "Contract Basis" },
]

export const salaryCreditOptions = [
  { value: "imps", label: "IMPS" },
  { value: "rtgs", label: "RTGS" },
  { value: "neft", label: "NEFT" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
]

export const expectedLoanTypeOptions = [
  { value: "term-loan", label: "Term Loan" },
  { value: "od", label: "Overdraft (OD)" },
]

export const incentiveFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

export const EXISTING_LOAN_TYPE_MAP: Record<string, ExistingLoanType> = {
  od: "overdraft",
  "credit-card": "credit_card",
  "app-loan": "app_loan",
  "personal-loan": "personal_loan",
}

export const EXPECTED_LOAN_TYPE_MAP: Record<string, ExpectedLoanType> = {
  "term-loan": "term_loan",
  od: "overdraft",
}

export const COMPANY_TYPE_MAP: Record<string, CompanyType> = {
  "pvt-ltd": "private_limited",
  govt: "government",
  llp: "llp",
  proprietorship: "proprietorship",
  partnership: "partnership",
  school: "school",
  trust: "trust",
  ngo: "ngo",
  contract: "contract_basis",
}

// =========================================================================
// HELPERS (parsing, payload building, validation)
// =========================================================================

/** Strips any "-" characters so numeric fields (CIBIL, enquiries, age, amounts, rates) can never go negative. */
export function stripNegative(value: string): string {
  return value.replace(/-/g, "")
}

/** "" -> undefined, otherwise Number(value). Keeps optional numeric fields out of the payload when blank. */
export function toNumber(value: string): number | undefined {
  if (value == null || value.trim() === "") return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

/** Accepts "YYYY-MM-DD" (native date input) or "DD/MM/YYYY" (custom calendar picker) -> ISO date string. */
export function toISODate(value: string): string | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (match) {
    const [, dd, mm, yyyy] = match
    return `${yyyy}-${mm}-${dd}`
  }
  return null
}

// -------------------------------------------------------------------------
// Build the backend payload from local form state
// -------------------------------------------------------------------------
export function buildPayload(form: ApplyFormState): LoanApplicationRequest {
  const isBT = form.caseType === "bt"

  const mappedExistingLoans: ApiExistingLoan[] = isBT
    ? form.existingLoans.map((loan) => ({
        loan_type: EXISTING_LOAN_TYPE_MAP[loan.type] ?? "personal_loan",
        loan_amount_outstanding: toNumber(loan.amount) ?? null,
        principal_outstanding: toNumber(loan.principalOutstanding) ?? 0,
        current_bank_name: loan.bankName,
        current_interest_rate: toNumber(loan.interestRate) ?? null,
        loan_disbursement_date: toISODate(loan.startDate),
        current_emi: toNumber(loan.currentEMI) ?? 0,
        foreclosure_available: loan.foreclosureAvailable === "yes",
        any_emi_bounce: loan.emiBounce === "yes",
        selected_for_bt: true,
      }))
    : []

  return {
    case_type: isBT ? "balance_transfer" : "fresh_loan",
    personal: {
      full_name: form.name,
      age: toNumber(form.age) ?? 0,
      pincode: form.pincode,
    },
    loan_requirements: isBT
      ? {}
      : {
          expected_loan_type: EXPECTED_LOAN_TYPE_MAP[form.expectedLoanType] ?? null,
          expected_interest_rate: toNumber(form.expectedInterestRate) ?? null,
          expected_emi: toNumber(form.expectedEMI) ?? null,
          principal_amount_required: toNumber(form.expectedPrincipal) ?? null,
        },
    employment: {
      company_type: COMPANY_TYPE_MAP[form.companyType] ?? null,
      company_age_years: toNumber(form.companyAge) ?? null,
      salary_credit_type: (form.salaryCreditType as SalaryCreditType) || null,
    },
    credit_history: {
      cibil_score: toNumber(form.cibilScore) ?? 0,
      enquiries_last_3_months: toNumber(form.enquiries) ?? 0,
      bounce_latest_month: form.bounceLatest === "yes",
      any_overdue_pending: form.overduePending === "yes",
      past_delayed_payments: form.pastDelayed === "yes",
      settlement_writeoff_suit_filed: form.settlementWriteOff === "yes",
      settlement_writeoff_date:
        form.settlementWriteOff === "yes" ? toISODate(form.settlementDate) : null,
    },
    salary_banking: {
      fixed_salary_component: toNumber(form.fixedSalary) ?? 0,
      incentive_variable_pay: toNumber(form.incentive) ?? 0,
      incentive_frequency: (form.incentiveFrequency as IncentiveFrequency) || "monthly",
      pf_deducted: form.pfDeducted === "yes",
      tds_deducted: form.tdsDeducted === "yes",
      official_mail_available: form.officialMailAvailable === "yes",
      home_loan_history_or_running: form.homeLoanHistory === "yes",
    },
    existing_loans: mappedExistingLoans,
    flags: {},
  }
}

// -------------------------------------------------------------------------
// Per-step validation — every field is mandatory. Used both to gate
// "Next Step" (can't advance with an incomplete step) and to double-check
// everything right before submit.
// -------------------------------------------------------------------------
export function validateStep1(form: ApplyFormState): string | null {
  if (!form.name.trim() || form.name.trim().length < 2) return "Please enter your full name."
  const ageNum = toNumber(form.age)
  if (ageNum == null || ageNum < 18 || ageNum > 80) return "Age must be between 18 and 80."
  if (!/^[1-9][0-9]{5}$/.test(form.pincode.trim())) return "Please enter a valid 6-digit pincode."
  return null
}

export function validateStep2(form: ApplyFormState): string | null {
  if (form.caseType === "bt") {
    for (let i = 0; i < form.existingLoans.length; i++) {
      const loan = form.existingLoans[i]
      if (!loan.type) return `Loan ${i + 1}: please select the type of loan.`
      if (!toNumber(loan.amount)) return `Loan ${i + 1}: please enter the loan amount outstanding.`
      if (!loan.bankName.trim()) return `Loan ${i + 1}: please enter the current bank name.`
      if (!toNumber(loan.interestRate)) return `Loan ${i + 1}: please enter the current interest rate.`
      if (!loan.startDate.trim()) return `Loan ${i + 1}: please enter the loan disbursement date.`
      if (!toNumber(loan.principalOutstanding)) return `Loan ${i + 1}: please enter the principal outstanding.`
      if (!toNumber(loan.currentEMI)) return `Loan ${i + 1}: please enter the current EMI.`
    }
    return null
  }
  if (!form.expectedLoanType) return "Please select the expected type of loan."
  if (!toNumber(form.expectedInterestRate)) return "Please enter the expected interest rate."
  if (!toNumber(form.expectedEMI)) return "Please enter the expected EMI."
  if (!toNumber(form.expectedPrincipal)) return "Please enter the principal amount required."
  return null
}

export function validateStep3(form: ApplyFormState): string | null {
  if (!form.companyType) return "Please select your company type."
  if (toNumber(form.companyAge) == null) return "Please enter the age of your company."
  if (!form.salaryCreditType) return "Please select your salary credit type."
  return null
}

export function validateStep4(form: ApplyFormState): string | null {
  const cibil = toNumber(form.cibilScore)
  if (cibil == null || cibil < 300 || cibil > 900) return "CIBIL score must be between 300 and 900."
  if (toNumber(form.enquiries) == null) return "Please enter the number of enquiries in the last 3 months."
  if (form.settlementWriteOff === "yes" && !form.settlementDate.trim()) {
    return "Please enter the date of settlement / write-off."
  }
  return null
}

export function validateStep5(form: ApplyFormState): string | null {
  if (!toNumber(form.fixedSalary)) return "Please enter your fixed salary component."
  if (toNumber(form.incentive) == null) return "Please enter your incentive / variable pay (enter 0 if none)."
  if (!form.incentiveFrequency) return "Please select your incentive frequency."
  return null
}

export function validateStep(step: number, form: ApplyFormState): string | null {
  switch (step) {
    case 1: return validateStep1(form)
    case 2: return validateStep2(form)
    case 3: return validateStep3(form)
    case 4: return validateStep4(form)
    case 5: return validateStep5(form)
    default: return null
  }
}

export function validateBeforeSubmit(form: ApplyFormState): string | null {
  return (
    validateStep1(form) ||
    validateStep2(form) ||
    validateStep3(form) ||
    validateStep4(form) ||
    validateStep5(form)
  )
}