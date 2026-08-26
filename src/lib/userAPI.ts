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

// -----------------------------------------------------------------------
// Recommendation feedback (like / dislike)
// -----------------------------------------------------------------------

export type FeedbackSentiment = "like" | "dislike"

export interface ApplicationFeedbackUpsert {
  sentiment: FeedbackSentiment
  comment?: string | null
}

export interface ApplicationFeedbackRead {
  id: number
  application_id: number
  user_id: number
  sentiment: FeedbackSentiment
  comment: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ApplicationFeedbackListItem extends ApplicationFeedbackRead {
  username: string | null
  user_full_name: string | null
  applicant_name: string | null
  case_type: string | null
}

export interface ApplicationFeedbackListResponse {
  total: number
  likes: number
  dislikes: number
  items: ApplicationFeedbackListItem[]
}

export interface FeedbackTrendHighlight {
  label: string
  application_id: number | null
  comment: string | null
  count: number
}

export interface FeedbackTrendMonth {
  month: string
  label: string
  likes: number
  dislikes: number
  total: number
  accuracy: number | null
  top_liked: FeedbackTrendHighlight | null
  top_disliked: FeedbackTrendHighlight | null
}

export interface FeedbackTrendsResponse {
  overall_accuracy: number | null
  months: FeedbackTrendMonth[]
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function satisfactionPct(likes: number, dislikes: number): number | null {
  const n = likes + dislikes
  if (n === 0) return null
  return Math.round((likes / n) * 1000) / 10
}

function monthKeyFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

/** Build monthly trends from the admin feedback list (fallback when /trends is missing). */
function buildTrendsFromFeedbackList(
  items: ApplicationFeedbackListItem[],
  months: number
): FeedbackTrendsResponse {
  const now = new Date()
  const endY = now.getUTCFullYear()
  const endM = now.getUTCMonth() // 0-based
  const monthKeys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(endY, endM - i, 1))
    monthKeys.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    )
  }

  type Bucket = {
    likes: ApplicationFeedbackListItem[]
    dislikes: ApplicationFeedbackListItem[]
  }
  const byMonth = new Map<string, Bucket>()
  for (const key of monthKeys) byMonth.set(key, { likes: [], dislikes: [] })

  for (const item of items) {
    const key = monthKeyFromIso(item.created_at ?? item.updated_at)
    if (!key || !byMonth.has(key)) continue
    const bucket = byMonth.get(key)!
    if (item.sentiment === "like") bucket.likes.push(item)
    else if (item.sentiment === "dislike") bucket.dislikes.push(item)
  }

  function topHighlight(
    rows: ApplicationFeedbackListItem[],
    preferComment: boolean
  ): FeedbackTrendHighlight | null {
    if (rows.length === 0) return null
    const counts = new Map<string, { count: number; sample: ApplicationFeedbackListItem }>()
    for (const row of rows) {
      const label = preferComment
        ? (row.comment?.trim() || row.applicant_name || row.case_type || `App #${row.application_id}`)
        : (row.applicant_name || row.case_type || `App #${row.application_id}`)
      const prev = counts.get(label)
      if (prev) prev.count += 1
      else counts.set(label, { count: 1, sample: row })
    }
    let best: { label: string; count: number; sample: ApplicationFeedbackListItem } | null = null
    for (const [label, v] of counts) {
      if (!best || v.count > best.count) best = { label, count: v.count, sample: v.sample }
    }
    if (!best) return null
    return {
      label: best.label,
      application_id: best.sample.application_id,
      comment: best.sample.comment,
      count: best.count,
    }
  }

  let totalLikes = 0
  let totalDislikes = 0
  const monthItems: FeedbackTrendMonth[] = monthKeys.map((key) => {
    const [ys, ms] = key.split("-")
    const y = Number(ys)
    const m = Number(ms)
    const bucket = byMonth.get(key)!
    const likes = bucket.likes.length
    const dislikes = bucket.dislikes.length
    totalLikes += likes
    totalDislikes += dislikes
    return {
      month: key,
      label: MONTH_LABELS[m - 1] ?? key,
      likes,
      dislikes,
      total: likes + dislikes,
      accuracy: satisfactionPct(likes, dislikes),
      top_liked: topHighlight(bucket.likes, false),
      top_disliked: topHighlight(bucket.dislikes, true),
    }
  })

  return {
    overall_accuracy: satisfactionPct(totalLikes, totalDislikes),
    months: monthItems,
  }
}

/** Admin: list all users' like/dislike feedback. */
export function listAllApplicationFeedback(params?: {
  sentiment?: FeedbackSentiment
  limit?: number
}): Promise<ApplicationFeedbackListResponse> {
  const search = new URLSearchParams()
  if (params?.sentiment) search.set("sentiment", params.sentiment)
  if (params?.limit != null) search.set("limit", String(params.limit))
  const qs = search.toString()
  return apiFetch<ApplicationFeedbackListResponse>(
    `/eligibility/feedback${qs ? `?${qs}` : ""}`
  )
}

/**
 * Admin: monthly like/dislike trend for dashboard charts.
 * Falls back to aggregating GET /eligibility/feedback when /trends is not deployed (404).
 */
export async function getApplicationFeedbackTrends(
  months: number = 6
): Promise<FeedbackTrendsResponse> {
  const safeMonths = Math.min(24, Math.max(1, months))
  try {
    return await apiFetch<FeedbackTrendsResponse>(
      `/eligibility/feedback/trends?months=${safeMonths}`
    )
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) throw err
    const list = await listAllApplicationFeedback({ limit: 500 })
    return buildTrendsFromFeedbackList(list.items ?? [], safeMonths)
  }
}

/** Like / dislike an application's AI recommendations (upsert). */
export function submitApplicationFeedback(
  applicationId: number,
  body: ApplicationFeedbackUpsert
): Promise<ApplicationFeedbackRead> {
  return apiFetch<ApplicationFeedbackRead>(
    `/eligibility/applications/${applicationId}/feedback`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
}

/** Current user's feedback for an application, or null. */
export function getApplicationFeedback(
  applicationId: number
): Promise<ApplicationFeedbackRead | null> {
  return apiFetch<ApplicationFeedbackRead | null>(
    `/eligibility/applications/${applicationId}/feedback`
  )
}

/** Clear (undo) current user's feedback. Backend returns 204. */
export function clearApplicationFeedback(
  applicationId: number
): Promise<void> {
  return apiFetch<void>(`/eligibility/applications/${applicationId}/feedback`, {
    method: "DELETE",
  })
}

/** Alias for clearApplicationFeedback. */
export const deleteApplicationFeedback = clearApplicationFeedback

export function isBalanceTransferResponse(
  res: FreshLoanResponse | BalanceTransferResponse
): res is BalanceTransferResponse {
  return res.case_type === "balance_transfer"
}