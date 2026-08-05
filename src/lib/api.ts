const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
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
  return getCurrentUser()
}

export async function getCurrentUser(): Promise<UserRead> {
  const token = getToken()
  if (!token) throw new ApiError("Not authenticated", 401)

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    clearToken()
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
    clearToken()
    throw new ApiError("Session expired. Please log in again.", 401)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new ApiError(text || `Request failed (${res.status})`, res.status)
  }

  return res.json()
}

export { ApiError }

export type DocumentCategory = "bank_policy" | "case_study"
export type DocumentStatus = "draft" | "active"
export type RagStatus = "pending" | "processing" | "ready" | "failed"

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

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new ApiError(text || `Failed to upload document (${res.status})`, res.status)
  }

  return res.json()
}

export function updateKnowledgeDocument(
  id: number,
  data: KnowledgeDocumentUpdateInput
): Promise<KnowledgeDocumentRead> {
  return apiFetch<KnowledgeDocumentRead>(`/knowledge/documents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteKnowledgeDocument(id: number): Promise<void> {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}/knowledge/documents/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    throw new ApiError(`Failed to delete document (${res.status})`, res.status)
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

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new ApiError(text || `Failed to download document (${res.status})`, res.status)
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
  if (!res.ok) {
    throw new ApiError(`Failed to delete bank (${res.status})`, res.status)
  }
}