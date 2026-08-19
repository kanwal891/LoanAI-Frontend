import { AuthGuard } from "@/components/auth-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireRole="admin">
      <div className="min-h-screen bg-[#01040c]">
        <AdminSidebar />
        <div className="pl-64 transition-all duration-300">
          <AdminHeader />
          <main className="min-h-[calc(100vh-4rem)] p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}