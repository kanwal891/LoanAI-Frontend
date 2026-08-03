"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initialBanks, Bank, bankComparisonData } from "@/lib/mock-bank-data"

export default function BankManagementPage() {
  const [bankList, setBankList] = useState<Bank[]>(initialBanks)
  const [bankNameInput, setBankNameInput] = useState("")
  const [editingBankId, setEditingBankId] = useState<string | null>(null)

  const activeBanks = bankList.filter((bank) => bank.active)
  const editingBank = bankList.find((bank) => bank.id === editingBankId) ?? null

  const handleBankFormSubmit = () => {
    const name = bankNameInput.trim()
    if (!name) return

    if (editingBank) {
      setBankList((prev) =>
        prev.map((bank) =>
          bank.id === editingBank.id ? { ...bank, name } : bank
        )
      )
    } else {
      setBankList((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 9), name, active: true },
      ])
    }

    setBankNameInput("")
    setEditingBankId(null)
  }

  const handleEditBank = (bank: Bank) => {
    setBankNameInput(bank.name)
    setEditingBankId(bank.id)
  }

  const handleCancelBankEdit = () => {
    setBankNameInput("")
    setEditingBankId(null)
  }

  const toggleBankActive = (id: string) => {
    setBankList((prev) =>
      prev.map((bank) =>
        bank.id === id ? { ...bank, active: !bank.active } : bank
      )
    )
    if (editingBankId === id) {
      setEditingBankId(null)
      setBankNameInput("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Bank Management</h1>
        <p className="text-muted-foreground max-w-2xl">
          Add, edit, and deactivate banks available across the loan knowledge base.
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Bank Operations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the bank list and toggle active status for use in document uploads.
            </p>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-white">
            Active banks: <span className="font-semibold">{activeBanks.length}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Add / Edit Bank</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bankNameInput">Bank Name</Label>
                  <Input
                    id="bankNameInput"
                    placeholder="Enter bank name"
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1 bg-linear-to-r from-primary to-indigo-500"
                    onClick={handleBankFormSubmit}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {editingBank ? "Save Bank" : "Add Bank"}
                  </Button>
                  {editingBank && (
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10 bg-white/5"
                      onClick={handleCancelBankEdit}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Bank Status</h3>
              <div className="grid gap-3">
                {bankList.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{bank.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bank.active ? "Active" : "Deactivated"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-white/5 text-xs"
                        onClick={() => handleEditBank(bank)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={bank.active ? "secondary" : "outline"}
                        size="sm"
                        className="border-white/10 text-xs"
                        onClick={() => toggleBankActive(bank.id)}
                      >
                        {bank.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">Active Bank List</h3>
            <div className="space-y-3">
              {activeBanks.length > 0 ? (
                activeBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between rounded-2xl bg-[#0b1220] px-4 py-3"
                  >
                    <span className="text-sm text-white">{bank.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No active banks available.</p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Comparison data
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Policy-level bank overview</h2>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-white">
            Banks compared: <span className="font-semibold">{bankComparisonData.length}</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">FOIR</th>
                <th className="px-4 py-3">ROI</th>
                <th className="px-4 py-3">CIBIL</th>
                <th className="px-4 py-3">LTV</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bankComparisonData.map((row) => (
                <tr key={row.bank} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{row.bank}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.foir}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.roi}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.cibil}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.ltv}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.age}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.income}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}