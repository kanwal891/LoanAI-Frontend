export interface Bank {
  id: string
  name: string
  active: boolean
}

export const initialBanks: Bank[] = [
  { id: "hdfc", name: "HDFC Bank", active: true },
  { id: "icici", name: "ICICI Bank", active: true },
  { id: "axis", name: "Axis Bank", active: true },
  { id: "sbi", name: "SBI", active: true },
  { id: "kotak", name: "Kotak Mahindra Bank", active: true },
  { id: "yes", name: "Yes Bank", active: true },
  { id: "indusind", name: "IndusInd Bank", active: true },
  { id: "pnb", name: "Punjab National Bank", active: true },
]

export interface BankComparisonRow {
  bank: string
  foir: string
  roi: string
  cibil: string
  ltv: string
  age: string
  income: string
}

export const bankComparisonData: BankComparisonRow[] = [
  {
    bank: "HDFC Bank",
    foir: "60%",
    roi: "9.5%",
    cibil: "650+",
    ltv: "70%",
    age: "21-58",
    income: "₹25,000+",
  },
  {
    bank: "SBI",
    foir: "65%",
    roi: "9.2%",
    cibil: "660+",
    ltv: "75%",
    age: "21-60",
    income: "₹22,000+",
  },
  {
    bank: "ICICI Bank",
    foir: "55%",
    roi: "10.0%",
    cibil: "640+",
    ltv: "68%",
    age: "21-57",
    income: "₹26,000+",
  },
]
