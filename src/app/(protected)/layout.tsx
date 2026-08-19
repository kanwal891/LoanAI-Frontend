import { AuthGuard } from "@/components/auth-guard"

// This layout applies to every route inside the (protected) group —
// dashboard, profile, applications, apply, results — via a single
// AuthGuard instead of repeating it in each route's own layout.tsx.
// The "(protected)" folder name is a Next.js route group: it organizes
// files but does NOT appear in the URL, so /dashboard, /profile, etc.
// are unaffected.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}