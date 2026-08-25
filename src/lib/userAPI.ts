import { apiFetch, ApiError } from "./api"

export { ApiError }

export type CaseType = "fresh_loan" | "balance_transfer"

export type ExpectedLoanType = "term_loan" | "overdraft"

export type ExistingLoanType =
  | "overdraft"
  | "credit_card"
  | "app_loan"
  | "personal_loan"

export type CompanyType =
  | "proprietorship"
  | "partnership"
  | "private_limited"
  | "llp"
  | "government"
  | "school"
  | "trust"
  | "ngo"
  | "contract_basis"

export type IncentiveFrequency = "monthly" | "quarterly" | "yearly"

export type SalaryCreditType = "imps" | "rtgs" | "neft" | "upi" | "cash"

export interface PersonalDetails {
  full_name: string
  age: number // 18-80
  pincode: string
}

export interface LoanRequirements {
  expected_loan_type?: ExpectedLoanType | null
  expected_interest_rate?: number | null
  expected_emi?: number | null
  principal_amount_required?: number | null
  tenure_months?: number | null
}

export interface EmploymentDetails {
  company_type?: CompanyType | null
  company_age_years?: number | null
  salary_credit_type?: SalaryCreditType | null
}

export interface CreditHistory {
  cibil_score: number // 300-900
  enquiries_last_3_months?: number
  bounce_latest_month?: boolean
  any_overdue_pending?: boolean
  past_delayed_payments?: boolean
  settlement_writeoff_suit_filed?: boolean
  settlement_writeoff_date?: string | null // ISO date (YYYY-MM-DD)
}

export interface SalaryBanking {
  fixed_salary_component: number
  incentive_variable_pay?: number
  incentive_frequency?: IncentiveFrequency
  pf_deducted?: boolean
  tds_deducted?: boolean
  official_mail_available?: boolean
  home_loan_history_or_running?: boolean
}

export interface ExistingLoan {
  loan_type: ExistingLoanType
  loan_amount_outstanding?: number | null
  principal_outstanding: number
  current_bank_name: string
  current_interest_rate?: number | null
  loan_disbursement_date?: string | null // ISO date
  current_emi: number
  foreclosure_available?: boolean
  any_emi_bounce?: boolean
  selected_for_bt?: boolean
}

export interface ApplicationFlags {
  is_new_to_cibil?: boolean
  is_govt_profile?: boolean
  customer_category?: string | null
  incentive_inclusion_rate?: number 
}

export interface LoanApplicationRequest {
  case_type: CaseType
  personal: PersonalDetails
  loan_requirements?: LoanRequirements
  employment?: EmploymentDetails
  credit_history: CreditHistory
  salary_banking: SalaryBanking
  existing_loans?: ExistingLoan[]
  flags?: ApplicationFlags
  bank_ids?: number[] | null
}

export interface FreshLoanRequest {
  case_type?: "fresh_loan"
  net_income_monthly: number
  current_emi?: number
  tenure_months?: number | null
  age: number
  cibil_score: number
  customer_category?: string | null
  annual_interest_rate?: number | null
  requested_amount?: number | null
  bank_ids?: number[] | null
  is_new_to_cibil?: boolean
  is_govt_profile?: boolean
}

export interface GateResult {
  name: string
  passed: boolean
  required?: any
  actual?: any
  message: string
}

export interface BankRecommendation {
  bank_id: number
  bank_name: string
  bank_initial: string
  is_top_recommendation: boolean
  usp_tagline: string
  match_percent: number // 0-100

  interest_rate?: number | null
  interest_rate_min?: number | null
  interest_rate_max?: number | null
  interest_rate_display?: string | null 

  max_amount?: number | null
  max_amount_min?: number | null
  max_amount_max?: number | null
  max_amount_display?: string | null 

  tenure_months?: number | null
  monthly_emi?: number | null
  feature_tags: string[]
  policy_card_id: number
  document_id: number
  eligible: boolean

  // BT-only
  bt_principal_total?: number | null
  fresh_loan_topup?: number | null
  fresh_loan_topup_min?: number | null
  fresh_loan_topup_max?: number | null
}

export interface FreshLoanBankResult {
  bank_id: number
  bank_name: string
  document_id: number
  policy_card_id: number
  eligible: boolean
  reasons: string[]
  gates: GateResult[]
  foir_percent?: number | null
  foir_source?: string | null

  annual_interest_rate?: number | null
  annual_interest_rate_min?: number | null
  annual_interest_rate_max?: number | null
  interest_rate_display?: string | null 

  tenure_months?: number | null
  max_total_emi?: number | null
  proposed_emi?: number | null

  eligible_loan_amount?: number | null
  eligible_loan_amount_min?: number | null
  eligible_loan_amount_max?: number | null

  max_loan_cap?: number | null

  final_eligible_amount?: number | null
  final_eligible_amount_min?: number | null
  final_eligible_amount_max?: number | null
  eligible_amount_display?: string | null 

  requested_amount_ok?: boolean | null
  detected_products: any[]
}

export interface FreshLoanResponse {
  case_type: CaseType
  banks_evaluated: number
  application_id?: number | null
  recommendations: BankRecommendation[]
  results: FreshLoanBankResult[]
}

export interface BalanceTransferBankResult {
  bank_id: number
  bank_name: string
  document_id: number
  policy_card_id: number
  eligible: boolean
  reasons: string[]
  gates: GateResult[]
  foir_percent?: number | null
  foir_source?: string | null

  annual_interest_rate?: number | null
  annual_interest_rate_min?: number | null
  annual_interest_rate_max?: number | null
  interest_rate_display?: string | null

  tenure_months?: number | null
  max_total_emi?: number | null
  current_emi_retained?: number | null
  bt_emi_excluded?: number | null
  proposed_emi?: number | null

  eligible_loan_amount?: number | null
  eligible_loan_amount_min?: number | null
  eligible_loan_amount_max?: number | null

  max_loan_cap?: number | null

  final_eligible_amount?: number | null
  final_eligible_amount_min?: number | null
  final_eligible_amount_max?: number | null
  eligible_amount_display?: string | null

  bt_principal_total?: number | null
  fresh_loan_topup?: number | null
  fresh_loan_topup_min?: number | null
  fresh_loan_topup_max?: number | null

  detected_products: any[]
}

export interface BalanceTransferResponse {
  case_type: CaseType
  banks_evaluated: number
  application_id?: number | null
  derived: Record<string, any>
  recommendations: BankRecommendation[]
  results: BalanceTransferBankResult[]
}
export interface SavedApplicationSummary {
  id: number
  case_type: string 
  status: string
  applicant_name?: string | null
  banks_evaluated: number
  created_at?: string | null
  updated_at?: string | null
}

export interface SavedApplicationDetail {
  id: number
  user_id: number
  case_type: string // "fresh_loan" | "balance_transfer"
  status: string
  applicant_name?: string | null
  banks_evaluated: number
  payload: Record<string, any>
  derived: Record<string, any>
  recommendations: BankRecommendation[]
  results: Array<FreshLoanBankResult | BalanceTransferBankResult>
  created_at?: string | null
  updated_at?: string | null
}

export function evaluateLoanApplication(
  body: LoanApplicationRequest
): Promise<FreshLoanResponse | BalanceTransferResponse> {
  return apiFetch<FreshLoanResponse | BalanceTransferResponse>(
    "/eligibility/applications",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
}

export function updateApplication(
  id: number,
  body: LoanApplicationRequest
): Promise<FreshLoanResponse | BalanceTransferResponse> {
  return apiFetch<FreshLoanResponse | BalanceTransferResponse>(
    `/eligibility/applications/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
}

export function submitBalanceTransfer(
  body: LoanApplicationRequest
): Promise<BalanceTransferResponse> {
  return apiFetch<BalanceTransferResponse>("/eligibility/balance-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, case_type: "balance_transfer" as CaseType }),
  })
}

export function freshLoanEligibility(
  body: FreshLoanRequest
): Promise<FreshLoanResponse> {
  return apiFetch<FreshLoanResponse>("/eligibility/fresh-loan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export function listApplications(): Promise<SavedApplicationSummary[]> {
  return apiFetch<SavedApplicationSummary[]>("/eligibility/applications")
}

export function getApplication(id: number): Promise<SavedApplicationDetail> {
  return apiFetch<SavedApplicationDetail>(`/eligibility/applications/${id}`)
}

export function isBalanceTransferResponse(
  res: FreshLoanResponse | BalanceTransferResponse
): res is BalanceTransferResponse {
  return res.case_type === "balance_transfer"
}