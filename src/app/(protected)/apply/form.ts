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
// NOTE ON @/lib/userAPI TYPES
// =========================================================================
// This change set adds new fields to the payload (profession/location on
// personal, company_name on employment, enquiries_last_30_days on credit
// history, form_26as_available / form_16_available on salary_banking) and
// removes principal_outstanding from existing loans. `LoanApplicationRequest`
// / `ExistingLoan` in "@/lib/userAPI" will need matching updates or the
// object literals below will fail TS's excess-property checks. See the
// bottom of this file for the exact shape assumed.
// =========================================================================

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
  professionType: string
  govtGrade: string
  professionDescription: string
  location: string

  // Step 2A: Balance Transfer
  existingLoans: ExistingLoan[]

  // Step 2B: Fresh Case
  expectedLoanType: string
  expectedPrincipal: string
  hasExistingLoan: string
  existingLoansFresh: ExistingLoan[]

  // Step 3: Company Details
  companyType: string
  companyName: string
  companyAge: string
  salaryCreditType: string

  // Step 4: CIBIL & Credit
  cibilScore: string
  enquiries: string
  enquiries30Days: string
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
  form26ASAvailable: string
  form16Available: string
}

export const initialApplyFormState: ApplyFormState = {
  name: "",
  age: "",
  pincode: "",
  caseType: "fresh",
  professionType: "",
  govtGrade: "",
  professionDescription: "",
  location: "",

  existingLoans: [emptyExistingLoan("1")],

  expectedLoanType: "",
  expectedPrincipal: "",
  hasExistingLoan: "no",
  existingLoansFresh: [emptyExistingLoan("1")],

  companyType: "",
  companyName: "",
  companyAge: "",
  salaryCreditType: "",

  cibilScore: "",
  enquiries: "",
  enquiries30Days: "",
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
  form26ASAvailable: "no",
  form16Available: "no",
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

// Loan types used both for Balance Transfer loans and for the "existing
// loan" details captured on a Fresh Case.
export const loanTypeOptions = [
  { value: "od", label: "Overdraft (OD)" },
  { value: "credit-card", label: "Credit Card" },
  { value: "app-loan", label: "App Loan" },
  { value: "personal-loan", label: "Personal Loan" },
  { value: "home-loan", label: "Home Loan" },
  { value: "car-loan", label: "Car Loan" },
  { value: "secured-loan", label: "Secured Loan" },
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

export const professionTypeOptions = [
  { value: "doctor", label: "Doctor" },
  { value: "army", label: "Army" },
  { value: "govt-employee", label: "Government Employee" },
  { value: "ca", label: "CA" },
  { value: "other", label: "Other" },
]

export const govtGradeOptions = [
  { value: "grade-1", label: "Grade 1" },
  { value: "grade-2", label: "Grade 2" },
  { value: "grade-3", label: "Grade 3" },
  { value: "grade-4", label: "Grade 4" },
]

export const locationOptions = [
  { value: "metro", label: "Metro" },
  { value: "non-metro", label: "Non-Metro" },
]

export const EXISTING_LOAN_TYPE_MAP: Record<string, ExistingLoanType> = {
  od: "overdraft",
  "credit-card": "credit_card",
  "app-loan": "app_loan",
  "personal-loan": "personal_loan",
  "home-loan": "home_loan",
  "car-loan": "car_loan",
  "secured-loan": "secured_loan",
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

export const PROFESSION_TYPE_MAP: Record<string, string> = {
  doctor: "doctor",
  army: "army",
  "govt-employee": "government_employee",
  ca: "ca",
  other: "other",
}

export const GOVT_GRADE_MAP: Record<string, string> = {
  "grade-1": "grade_1",
  "grade-2": "grade_2",
  "grade-3": "grade_3",
  "grade-4": "grade_4",
}

export const LOCATION_TYPE_MAP: Record<string, string> = {
  metro: "metro",
  "non-metro": "non_metro",
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

function mapExistingLoan(loan: ExistingLoan, selectedForBT: boolean): ApiExistingLoan {
  return {
    loan_type: EXISTING_LOAN_TYPE_MAP[loan.type] ?? "personal_loan",
    loan_amount_outstanding: toNumber(loan.amount) ?? null,
    current_bank_name: loan.bankName,
    current_interest_rate: toNumber(loan.interestRate) ?? null,
    loan_disbursement_date: toISODate(loan.startDate),
    current_emi: toNumber(loan.currentEMI) ?? 0,
    foreclosure_available: loan.foreclosureAvailable === "yes",
    any_emi_bounce: loan.emiBounce === "yes",
    selected_for_bt: selectedForBT,
  } as ApiExistingLoan
}

// -------------------------------------------------------------------------
// Build the backend payload from local form state
// -------------------------------------------------------------------------
export function buildPayload(form: ApplyFormState): LoanApplicationRequest {
  const isBT = form.caseType === "bt"
  const isGovtEmployee = form.professionType === "govt-employee"

  const mappedExistingLoans: ApiExistingLoan[] = isBT
    ? form.existingLoans.map((loan) => mapExistingLoan(loan, true))
    : form.hasExistingLoan === "yes"
      ? form.existingLoansFresh.map((loan) => mapExistingLoan(loan, false))
      : []

  return {
    case_type: isBT ? "balance_transfer" : "fresh_loan",
    personal: {
      full_name: form.name,
      age: toNumber(form.age) ?? 0,
      pincode: form.pincode,
      profession_type: PROFESSION_TYPE_MAP[form.professionType] ?? null,
      government_employee_grade: isGovtEmployee ? GOVT_GRADE_MAP[form.govtGrade] ?? null : null,
      profession_description: form.professionDescription,
      location_type: LOCATION_TYPE_MAP[form.location] ?? null,
    },
    loan_requirements: isBT
      ? {}
      : {
          expected_loan_type: EXPECTED_LOAN_TYPE_MAP[form.expectedLoanType] ?? null,
          principal_amount_required: toNumber(form.expectedPrincipal) ?? null,
        },
    employment: {
      company_type: COMPANY_TYPE_MAP[form.companyType] ?? null,
      company_name: form.companyName,
      company_age_years: toNumber(form.companyAge) ?? null,
      salary_credit_type: (form.salaryCreditType as SalaryCreditType) || null,
    },
    credit_history: {
      cibil_score: toNumber(form.cibilScore) ?? 0,
      enquiries_last_3_months: toNumber(form.enquiries) ?? 0,
      enquiries_last_30_days: toNumber(form.enquiries30Days) ?? 0,
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
      form_26as_available: form.form26ASAvailable === "yes",
      form_16_available: form.form16Available === "yes",
    },
    existing_loans: mappedExistingLoans,
    flags: {},
  } as LoanApplicationRequest
}

// -------------------------------------------------------------------------
// Per-step validation — every field is mandatory. Used both to gate
// "Next Step" (can't advance with an incomplete step) and to double-check
// everything right before submit.
// -------------------------------------------------------------------------
function validateExistingLoanList(loans: ExistingLoan[]): string | null {
  for (let i = 0; i < loans.length; i++) {
    const loan = loans[i]
    if (!loan.type) return `Loan ${i + 1}: please select the type of loan.`
    if (!toNumber(loan.amount)) return `Loan ${i + 1}: please enter the loan amount outstanding.`
    if (!loan.bankName.trim()) return `Loan ${i + 1}: please enter the current bank name.`
    if (!toNumber(loan.interestRate)) return `Loan ${i + 1}: please enter the current interest rate.`
    if (!loan.startDate.trim()) return `Loan ${i + 1}: please enter the loan disbursement date.`
    if (!toNumber(loan.currentEMI)) return `Loan ${i + 1}: please enter the current EMI.`
  }
  return null
}

export function validateStep1(form: ApplyFormState): string | null {
  if (!form.name.trim() || form.name.trim().length < 2) return "Please enter your full name."
  const ageNum = toNumber(form.age)
  if (ageNum == null || ageNum < 18 || ageNum > 80) return "Age must be between 18 and 80."
  if (!/^[1-9][0-9]{5}$/.test(form.pincode.trim())) return "Please enter a valid 6-digit pincode."
  if (!form.professionType) return "Please select your type of profession."
  if (form.professionType === "govt-employee" && !form.govtGrade) {
    return "Please select your government employee grade."
  }
  if (!form.location) return "Please select your location (Metro / Non-Metro)."
  return null
}

export function validateStep2(form: ApplyFormState): string | null {
  if (form.caseType === "bt") {
    return validateExistingLoanList(form.existingLoans)
  }
  if (!form.expectedLoanType) return "Please select the expected type of loan."
  if (!toNumber(form.expectedPrincipal)) return "Please enter the principal amount required."
  if (form.hasExistingLoan === "yes") {
    return validateExistingLoanList(form.existingLoansFresh)
  }
  return null
}

export function validateStep3(form: ApplyFormState): string | null {
  if (!form.companyType) return "Please select your company type."
  if (!form.companyName.trim()) return "Please enter your company name."
  if (toNumber(form.companyAge) == null) return "Please enter the age of your company."
  if (!form.salaryCreditType) return "Please select your salary credit type."
  return null
}

export function validateStep4(form: ApplyFormState): string | null {
  const cibil = toNumber(form.cibilScore)
  if (cibil == null || cibil < 300 || cibil > 900) return "CIBIL score must be between 300 and 900."
  if (toNumber(form.enquiries) == null) return "Please enter the number of enquiries in the last 3 months."
  if (toNumber(form.enquiries30Days) == null) return "Please enter the number of enquiries in the last 30 days."
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