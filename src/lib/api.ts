const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

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