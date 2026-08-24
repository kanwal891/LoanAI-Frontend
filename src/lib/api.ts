const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://loanai-backend-bms6.onrender.com"

export interface UserRead {
  id: number
  username: string
  email: string
  full_name: string | null
  role: string // "user" | "admin" (plain string on the backend, not a strict enum)
}

interface TokenResponse {
  access_token: string
  token_type: string
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
const TOKEN_KEY = "access_token"
const CACHED_USER_KEY = "cached_user"

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".xlsx", ".txt"])
const DEFAULT_MAX_UPLOAD_MB = 50
const MAX_UPLOAD_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB) || DEFAULT_MAX_UPLOAD_MB

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

/** Subscribe to "the current session just became invalid" events. Returns
 *  an unsubscribe function — call it on cleanup (e.g. in a useEffect). */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

function handleUnauthorized() {
  clearToken()
  unauthorizedListeners.forEach((listener) => listener())
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  clearCachedUser()
}

/** Stash a just-verified user for the page we're about to navigate to. */
function cacheVerifiedUser(user: UserRead) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CACHED_USER_KEY, JSON.stringify(user))
}

export function consumeCachedUser(): UserRead | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(CACHED_USER_KEY)
  if (!raw) return null
  sessionStorage.removeItem(CACHED_USER_KEY)
  try {
    return JSON.parse(raw) as UserRead
  } catch {
    return null
  }
}

function clearCachedUser() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(CACHED_USER_KEY)
}

export function getTokenExpiryMs(token: string): number | null {
  try {
    const payloadB64 = token.split(".")[1]
    if (!payloadB64) return null
    // JWTs use base64url; convert to standard base64 before atob().
    const normalized = payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")
    const payload = JSON.parse(atob(padded))
    if (typeof payload.exp !== "number") return null
    return payload.exp * 1000
  } catch {
    return null
  }
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => "")
  if (!text) return fallback
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed?.detail === "string") return parsed.detail
    if (Array.isArray(parsed?.detail)) {
      // FastAPI validation errors: [{ loc, msg, type }, ...]
      const joined = parsed.detail.map((d: any) => d.msg).filter(Boolean).join("; ")
      return joined || text
    }
    return text
  } catch {
    // Not JSON — likely plain text or HTML from a proxy/gateway error.
    return text
  }
}

export async function login(username: string, password: string): Promise<UserRead> {
  const body = new URLSearchParams()
  body.set("username", username)
  body.set("password", password)

  const tokenRes = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!tokenRes.ok) {
    if (tokenRes.status === 401) {
      throw new ApiError("Incorrect username or password", 401)
    }
    throw new ApiError("Login failed. Please try again.", tokenRes.status)
  }

  const { access_token }: TokenResponse = await tokenRes.json()
  setToken(access_token)

  const user = await getCurrentUser()
  cacheVerifiedUser(user)
  return user
}

/**
 * Validates the token against the backend.
 * @param timeoutMs how long to wait before giving up — keeps a cold/slow
 *   backend from hanging the caller (e.g. AuthGuard) forever.
 */
export async function getCurrentUser(timeoutMs = 15000): Promise<UserRead> {
  const token = getToken()
  if (!token) throw new ApiError("Not authenticated", 401)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err) {
    // Network error or timeout — likely a cold/slow backend, not a bad
    // token. Don't clear the token here; let the caller decide (AuthGuard
    // retries rather than logging the user out over a slow server).
    throw new ApiError("Could not reach the server. Please try again.", 0)
  }

  if (!res.ok) {
    // Any non-OK from /auth/me (401 expired/invalid, 403, etc.) means the
    // session is dead — this is the one endpoint whose entire purpose is
    // validating the token, so treat every failure here as unauthorized.
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", res.status)
  }

  return res.json()
}

export function logout() {
  clearToken()
}
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res, `Request failed (${res.status})`)
    throw new ApiError(message, res.status)
  }

  return res.json()
}

export { ApiError }

export type DocumentCategory = "bank_policy" | "case_study"
export type DocumentStatus = "draft" | "active"
export type RagStatus = "pending" | "processing" | "ready" | "failed"

export type ExtractionStatus =
  | "pending"
  | "extracting"
  | "extracted"
  | "reviewed"
  | "failed"

export type ExtractReviewStatus = "extracted" | "reviewed" | "rejected"

export interface BankSummary {
  id: number
  bank_name: string
}

export interface KnowledgeDocumentRead {
  id: number
  document_name: string
  bank_id: number
  bank: BankSummary | null
  category: DocumentCategory
  version: string
  effective_date: string | null
  expiry_date: string | null
  description: string | null
  status: DocumentStatus
  extraction_status: ExtractionStatus
  extraction_error: string | null
  rag_status: RagStatus
  original_filename: string
  content_type: string
  file_size: number
  uploaded_by: number | null
  created_at: string
  updated_at: string
}

export interface KnowledgeDocumentCreateInput {
  document_name: string
  bank_id: number
  category: DocumentCategory
  version: string
  effective_date?: string
  expiry_date?: string
  description?: string
  file: File
  status?: DocumentStatus
}

export interface KnowledgeDocumentUpdateInput {
  document_name?: string
  bank_id?: number
  category?: DocumentCategory
  version?: string
  effective_date?: string
  expiry_date?: string
  description?: string
  status?: DocumentStatus
}

export function listKnowledgeDocuments(): Promise<KnowledgeDocumentRead[]> {
  return apiFetch<KnowledgeDocumentRead[]>("/knowledge/documents")
}

export function getKnowledgeDocument(id: number): Promise<KnowledgeDocumentRead> {
  return apiFetch<KnowledgeDocumentRead>(`/knowledge/documents/${id}`)
}

export async function uploadKnowledgeDocument(
  data: KnowledgeDocumentCreateInput
): Promise<KnowledgeDocumentRead> {
  const token = getToken()
  if (!token) throw new ApiError("Not authenticated", 401)

  const filename = data.file?.name || ""
  const suffix = filename.includes(".") ? `.${filename.split(".").pop()?.toLowerCase()}` : ""
  if (!ALLOWED_EXTENSIONS.has(suffix)) {
    throw new ApiError(
      `Unsupported file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`,
      400
    )
  }
  if (data.file.size === 0) {
    throw new ApiError("Empty file", 400)
  }
  if (data.file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    throw new ApiError(`File exceeds maximum size of ${MAX_UPLOAD_SIZE_MB} MB`, 400)
  }

  const formData = new FormData()
  formData.append("document_name", data.document_name)
  formData.append("bank_id", String(data.bank_id))
  formData.append("category", data.category)
  formData.append("version", data.version)
  if (data.effective_date) formData.append("effective_date", data.effective_date)
  if (data.expiry_date) formData.append("expiry_date", data.expiry_date)
  if (data.description) formData.append("description", data.description)
  if (data.status) formData.append("status", data.status)
  formData.append("file", data.file)

  const res = await fetch(`${API_BASE_URL}/knowledge/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  if (!res.ok) {
    const status = res.status
    const message = await extractErrorMessage(
      res,
      status >= 500
        ? `Server error uploading document (${status}). Try again later.`
        : `Failed to upload document (${status})`
    )
    throw new ApiError(message, status)
  }

  return res.json()
}

export async function updateKnowledgeDocument(
  id: number,
  data: KnowledgeDocumentUpdateInput
): Promise<KnowledgeDocumentRead> {
  const token = getToken()
  const formData = new FormData()

  if (data.document_name !== undefined) formData.append("document_name", data.document_name)
  if (data.bank_id !== undefined) formData.append("bank_id", String(data.bank_id))
  if (data.category !== undefined) formData.append("category", data.category)
  if (data.version !== undefined) formData.append("version", data.version)
  if (data.effective_date) formData.append("effective_date", data.effective_date)
  if (data.expiry_date) formData.append("expiry_date", data.expiry_date)
  if (data.description !== undefined) formData.append("description", data.description)
  if (data.status !== undefined) formData.append("status", data.status)

  const res = await fetch(`${API_BASE_URL}/knowledge/documents/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", 401)
  }
  if (!res.ok) {
    const message = await extractErrorMessage(res, `Failed to update document (${res.status})`)
    throw new ApiError(message, res.status)
  }

  return res.json()
}

export async function deleteKnowledgeDocument(id: number): Promise<void> {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}/knowledge/documents/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res, `Failed to delete document (${res.status})`)
    throw new ApiError(message, res.status)
  }
}

export async function downloadKnowledgeDocument(id: number): Promise<Blob> {
  const token = getToken()
  if (!token) throw new ApiError("Not authenticated", 401)

  const res = await fetch(`${API_BASE_URL}/knowledge/documents/${id}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res, `Failed to download document (${res.status})`)
    throw new ApiError(message, res.status)
  }

  return res.blob()
}

export type BankStatus = "active" | "deactive"

export interface BankRead {
  id: number
  bank_name: string
  status: BankStatus
}

export interface BankCreateInput {
  bank_name: string
  status?: BankStatus
}

export interface BankUpdateInput {
  bank_name?: string
  status?: BankStatus
}

export function listBanks(): Promise<BankRead[]> {
  return apiFetch<BankRead[]>("/banks/")
}

export function getBank(id: number): Promise<BankRead> {
  return apiFetch<BankRead>(`/banks/${id}`)
}

export function createBank(data: BankCreateInput): Promise<BankRead> {
  return apiFetch<BankRead>("/banks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateBank(id: number, data: BankUpdateInput): Promise<BankRead> {
  return apiFetch<BankRead>(`/banks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteBank(id: number): Promise<void> {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}/banks/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (res.status === 401) {
    handleUnauthorized()
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  if (!res.ok) {
    const message = await extractErrorMessage(res, `Failed to delete bank (${res.status})`)
    throw new ApiError(message, res.status)
  }
}

export interface PolicyCardRead {
  id: number
  document_id: number
  bank_id: number
  extracted_json: Record<string, any>
  status: ExtractReviewStatus
  reviewed_by: number | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface PolicyCardUpdate {
  extracted_json: Record<string, any>
}

export interface CaseRecordRead {
  id: number
  document_id: number
  bank_id: number
  row_index: number
  extracted_json: Record<string, any>
  status: ExtractReviewStatus
  created_at: string
  updated_at: string
}

export interface ExtractionResultRead {
  document_id: number
  category: DocumentCategory
  extraction_status: ExtractionStatus
  extraction_error?: string | null
  policy_card?: PolicyCardRead | null
  case_records: CaseRecordRead[]
}

export interface ReviewAction {
  action: "approve" | "reject"
  reason?: string | null
}

/**
 * Fetch extraction result for a knowledge document.
 */
export function getExtractionResult(documentId: number): Promise<ExtractionResultRead> {
  return apiFetch<ExtractionResultRead>(`/knowledge/documents/${documentId}/extraction`)
}

/**
 * Call backend diagnostic endpoint that checks Supabase storage auth.
 * Server must implement `GET /knowledge/_diag/supabase-storage` (protected).
 */
export function diagSupabaseStorage(): Promise<{ ok: boolean; sample_count?: number; detail?: string }>{
  return apiFetch(`/knowledge/_diag/supabase-storage`)
}

// -----------------------------------------------------------------------
// Extraction trigger + review
// -----------------------------------------------------------------------
export function runExtraction(documentId: number): Promise<KnowledgeDocumentRead> {
  return apiFetch<KnowledgeDocumentRead>(`/knowledge/documents/${documentId}/extract`, {
    method: "POST",
  })
}

export function reviewExtraction(
  documentId: number,
  action: "approve" | "reject",
  reason?: string
): Promise<KnowledgeDocumentRead> {
  return apiFetch<KnowledgeDocumentRead>(`/knowledge/documents/${documentId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, reason: reason || null }),
  })
}

export function updatePolicyCard(
  documentId: number,
  extracted_json: Record<string, any>
): Promise<PolicyCardRead> {
  return apiFetch<PolicyCardRead>(`/knowledge/documents/${documentId}/policy-card`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_json }),
  })
}

// -----------------------------------------------------------------------
// Bank comparison (FOIR / ROI / CIBIL / LTV / age / income)
// -----------------------------------------------------------------------
export interface PolicyComparisonRow {
  bank_id: number
  bank_name: string
  document_id: number
  policy_card_id: number
  extraction_status: string | null
  foir: number | null
  roi: number | null
  cibil: number | null
  ltv: number | null
  age: string | null
  age_min: number | null
  age_max: number | null
  income: number | null
  detected_products: any[]
}

export interface PolicyComparisonResponse {
  banks_compared: number
  reviewed_only: boolean
  rows: PolicyComparisonRow[]
}

export function getPolicyComparison(
  reviewedOnly: boolean = true,
  bankIds?: number[]
): Promise<PolicyComparisonResponse> {
  const params = new URLSearchParams()
  params.set("reviewed_only", String(reviewedOnly))
  if (bankIds && bankIds.length > 0) {
    bankIds.forEach((id) => params.append("bank_id", String(id)))
  }
  return apiFetch<PolicyComparisonResponse>(`/knowledge/comparison?${params.toString()}`)
}