"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Building2, 
  CreditCard, 
  Wallet, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Percent,
  Banknote,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"
import { FloatingInput } from "@/components/floating-input"
import { FloatingSelect } from "@/components/floating-select"
import { SegmentedToggle } from "@/components/segmented-toggle"
import { AICopilotSidebar } from "@/components/ai-copilot-sidebar"

interface ExistingLoan {
  id: string
  type: string
  amount: string
  bankName: string
  interestRate: string
  startDate: string
  principalOutstanding: string
  foreclosureAvailable: string
  currentEMI: string
  emiBounce: string
}

const steps = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Loan Details", icon: CreditCard },
  { id: 3, title: "Company Details", icon: Building2 },
  { id: 4, title: "Credit History", icon: AlertCircle },
  { id: 5, title: "Salary & Banking", icon: Wallet },
]

const loanTypeOptions = [
  { value: "od", label: "Overdraft (OD)" },
  { value: "credit-card", label: "Credit Card" },
  { value: "app-loan", label: "App Loan" },
  { value: "personal-loan", label: "Personal Loan" },
]

const companyTypeOptions = [
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

const salaryCreditOptions = [
  { value: "imps", label: "IMPS" },
  { value: "rtgs", label: "RTGS" },
  { value: "neft", label: "NEFT" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
]

const expectedLoanTypeOptions = [
  { value: "term-loan", label: "Term Loan" },
  { value: "od", label: "Overdraft (OD)" },
]

const incentiveFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showCopilot, setShowCopilot] = useState(true)
  
  // Step 1: Personal Details
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [pincode, setPincode] = useState("")
  const [caseType, setCaseType] = useState("fresh")
  
  // Step 2A: Balance Transfer
  const [existingLoans, setExistingLoans] = useState<ExistingLoan[]>([
    { id: "1", type: "", amount: "", bankName: "", interestRate: "", startDate: "", principalOutstanding: "", foreclosureAvailable: "no", currentEMI: "", emiBounce: "no" }
  ])
  
  // Step 2B: Fresh Case
  const [expectedLoanType, setExpectedLoanType] = useState("")
  const [expectedInterestRate, setExpectedInterestRate] = useState("")
  const [expectedEMI, setExpectedEMI] = useState("")
  const [expectedPrincipal, setExpectedPrincipal] = useState("")
  
  // Step 3: Company Details
  const [companyType, setCompanyType] = useState("")
  const [companyAge, setCompanyAge] = useState("")
  const [salaryCreditType, setSalaryCreditType] = useState("")
  
  // Step 4: CIBIL & Credit
  const [cibilScore, setCibilScore] = useState("")
  const [enquiries, setEnquiries] = useState("")
  const [bounceLatest, setBounceLatest] = useState("no")
  const [overduePending, setOverduePending] = useState("no")
  const [pastDelayed, setPastDelayed] = useState("no")
  const [settlementWriteOff, setSettlementWriteOff] = useState("no")
  const [settlementDate, setSettlementDate] = useState("")
  
  // Step 5: Salary & Banking
  const [fixedSalary, setFixedSalary] = useState("")
  const [incentive, setIncentive] = useState("")
  const [incentiveFrequency, setIncentiveFrequency] = useState("")
  const [pfDeducted, setPfDeducted] = useState("no")
  const [tdsDeducted, setTdsDeducted] = useState("no")
  const [officialMailAvailable, setOfficialMailAvailable] = useState("no")
  const [homeLoanHistory, setHomeLoanHistory] = useState("no")

  const addExistingLoan = () => {
    setExistingLoans([
      ...existingLoans,
      { id: Date.now().toString(), type: "", amount: "", bankName: "", interestRate: "", startDate: "", principalOutstanding: "", foreclosureAvailable: "no", currentEMI: "", emiBounce: "no" }
    ])
  }

  const removeExistingLoan = (id: string) => {
    if (existingLoans.length > 1) {
      setExistingLoans(existingLoans.filter(loan => loan.id !== id))
    }
  }

  const updateExistingLoan = (id: string, field: keyof ExistingLoan, value: string) => {
    setExistingLoans(existingLoans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const [direction, setDirection] = useState(0)

  const handleNext = () => {
    setDirection(1)
    nextStep()
  }

  const handlePrev = () => {
    setDirection(-1)
    prevStep()
  }

  return (
    <main className="min-h-screen bg-[#080B14]">
      
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showCopilot ? "mr-80" : ""}`}>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8"
>
  <Link
    href="/dashboard"
    className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to Dashboard
  </Link>

  <h1 className="text-3xl font-bold text-white">
    Personal Loan Application
  </h1>

  <p className="mt-2 text-muted-foreground">
    Fill in your details to receive AI-powered loan recommendations.
  </p>
</motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#1B4FBB] to-[#6366F1]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                {steps.map((step, index) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep > step.id
                          ? "bg-[#10B981]"
                          : currentStep === step.id
                          ? "bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] shadow-[0_0_20px_rgba(27,79,187,0.4)]"
                          : "bg-white/10"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <step.icon className={`w-5 h-5 ${currentStep === step.id ? "text-white" : "text-muted-foreground"}`} />
                      )}
                    </motion.div>
                    <span className={`mt-2 text-xs font-medium ${
                      currentStep >= step.id ? "text-white" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form Content */}
            <GlassCard
  className="p-8 relative overflow-visible"
  hover={false}
>
              <AuroraBackground intensity="low" />
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {/* Step 1: Personal Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Personal Details</h2>
                        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FloatingInput
                          label="Full Name"
                          value={name}
                          onChange={setName}
                          icon={<User className="w-5 h-5" />}
                        />
                        <FloatingInput
                          label="Age"
                          type="number"
                          value={age}
                          onChange={setAge}
                          icon={<Calendar className="w-5 h-5" />}
                        />
                      </div>

                      <FloatingInput
                        label="Pincode"
                        value={pincode}
                        onChange={setPincode}
                        icon={<MapPin className="w-5 h-5" />}
                      />

                      <div>
                        <label className="text-sm text-muted-foreground mb-3 block">Loan Type</label>
                        <SegmentedToggle
                          options={[
                            { value: "fresh", label: "Fresh Case", description: "New loan application" }
                          ]}
                          value={caseType}
                          onChange={(v) => setCaseType("fresh")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Loan Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-1">
                          {caseType === "bt" ? "Existing Loan Details" : "Expected Loan Details"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {caseType === "bt" 
                            ? "Enter your current loan information for balance transfer"
                            : "Tell us about your loan requirements"
                          }
                        </p>
                      </div>

                      <AnimatePresence mode="wait">
                        {caseType === "bt" ? (
                          <motion.div
                            key="bt"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6"
                          >
                            {existingLoans.map((loan, index) => (
                              <motion.div
                                key={loan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 rounded-xl glass border border-white/10"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="font-medium text-white">Loan {index + 1}</h3>
                                  {existingLoans.length > 1 && (
                                    <button
                                      onClick={() => removeExistingLoan(loan.id)}
                                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <FloatingSelect
                                    label="Type of Loan"
                                    options={loanTypeOptions}
                                    value={loan.type}
                                    onChange={(v) => updateExistingLoan(loan.id, "type", v)}
                                  />
                                  <FloatingInput
                                    label="Loan Amount Outstanding"
                                    value={loan.amount}
                                    onChange={(v) => updateExistingLoan(loan.id, "amount", v)}
                                    prefix="₹"
                                    icon={<Banknote className="w-5 h-5" />}
                                  />
                                  <FloatingInput
                                    label="Current Bank Name"
                                    value={loan.bankName}
                                    onChange={(v) => updateExistingLoan(loan.id, "bankName", v)}
                                    icon={<Building2 className="w-5 h-5" />}
                                  />
                                  <FloatingInput
                                    label="Current Rate of Interest (%)"
                                    value={loan.interestRate}
                                    onChange={(v) => updateExistingLoan(loan.id, "interestRate", v)}
                                    icon={<Percent className="w-5 h-5" />}
                                  />
                                  <FloatingInput
                                    label="Loan Start Date"
                                    type="date"
                                    value={loan.startDate}
                                    onChange={(v) => updateExistingLoan(loan.id, "startDate", v)}
                                  />
                                  <FloatingInput
                                    label="Principal Outstanding"
                                    value={loan.principalOutstanding}
                                    onChange={(v) => updateExistingLoan(loan.id, "principalOutstanding", v)}
                                    prefix="₹"
                                  />
                                  <FloatingInput
                                    label="Current EMI"
                                    value={loan.currentEMI}
                                    onChange={(v) => updateExistingLoan(loan.id, "currentEMI", v)}
                                    prefix="₹"
                                  />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-2 block">Foreclosure Available</label>
                                    <SegmentedToggle
                                      options={[
                                        { value: "yes", label: "Yes" },
                                        { value: "no", label: "No" }
                                      ]}
                                      value={loan.foreclosureAvailable}
                                      onChange={(v) => updateExistingLoan(loan.id, "foreclosureAvailable", v)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-2 block">Any EMI Bounce</label>
                                    <SegmentedToggle
                                      options={[
                                        { value: "yes", label: "Yes" },
                                        { value: "no", label: "No" }
                                      ]}
                                      value={loan.emiBounce}
                                      onChange={(v) => updateExistingLoan(loan.id, "emiBounce", v)}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            ))}

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={addExistingLoan}
                              className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-[#1B4FBB] text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-5 h-5" />
                              Add More Loan
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="fresh"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6"
                          >
                            <div className="grid md:grid-cols-2 gap-6">
                              <FloatingSelect
                                label="Expected Type of Loan"
                                options={expectedLoanTypeOptions}
                                value={expectedLoanType}
                                onChange={setExpectedLoanType}
                              />
                              <FloatingInput
                                label="Expected Rate of Interest (%)"
                                value={expectedInterestRate}
                                onChange={setExpectedInterestRate}
                                icon={<Percent className="w-5 h-5" />}
                              />
                              <FloatingInput
                                label="Expected EMI"
                                value={expectedEMI}
                                onChange={setExpectedEMI}
                                prefix="₹"
                                icon={<Banknote className="w-5 h-5" />}
                              />
                              <FloatingInput
                                label="Principal Amount Required"
                                value={expectedPrincipal}
                                onChange={setExpectedPrincipal}
                                prefix="₹"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Step 3: Company Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Employment & Company Details</h2>
                        <p className="text-sm text-muted-foreground">Tell us about your employment</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FloatingSelect
                          label="Type of Company"
                          options={companyTypeOptions}
                          value={companyType}
                          onChange={setCompanyType}
                          icon={<Building2 className="w-5 h-5" />}
                        />
                        <FloatingInput
                          label="Age of Company (Years)"
                          type="number"
                          value={companyAge}
                          onChange={setCompanyAge}
                          icon={<Calendar className="w-5 h-5" />}
                        />
                      </div>

                      <FloatingSelect
                        label="Salary Credit Type"
                        options={salaryCreditOptions}
                        value={salaryCreditType}
                        onChange={setSalaryCreditType}
                        icon={<Wallet className="w-5 h-5" />}
                      />
                    </div>
                  )}

                  {/* Step 4: CIBIL & Credit History */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Credit Health Analysis</h2>
                        <p className="text-sm text-muted-foreground">Your credit history helps us find the best rates</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FloatingInput
                          label="CIBIL Score"
                          type="number"
                          value={cibilScore}
                          onChange={setCibilScore}
                          placeholder="300-900"
                        />
                        <FloatingInput
                          label="Enquiries in Last 3 Months"
                          type="number"
                          value={enquiries}
                          onChange={setEnquiries}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">Bounce in Latest Month</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={bounceLatest}
                            onChange={setBounceLatest}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">Any Overdue Pending</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={overduePending}
                            onChange={setOverduePending}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">Past Delayed Payments</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={pastDelayed}
                            onChange={setPastDelayed}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">Settlement / Write Off / Suit Filed</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={settlementWriteOff}
                            onChange={setSettlementWriteOff}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {settlementWriteOff === "yes" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <FloatingInput
                              label="Date of Settlement / Write Off"
                              type="date"
                              value={settlementDate}
                              onChange={setSettlementDate}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Step 5: Salary & Banking */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Salary & Banking Information</h2>
                        <p className="text-sm text-muted-foreground">Your income details for accurate recommendations</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FloatingInput
                          label="Fixed Salary Component"
                          value={fixedSalary}
                          onChange={setFixedSalary}
                          prefix="₹"
                          icon={<Wallet className="w-5 h-5" />}
                        />
                        <FloatingInput
                          label="Incentive / Variable Pay"
                          value={incentive}
                          onChange={setIncentive}
                          prefix="₹"
                        />
                      </div>

                      <FloatingSelect
                        label="Incentive Frequency"
                        options={incentiveFrequencyOptions}
                        value={incentiveFrequency}
                        onChange={setIncentiveFrequency}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">PF Deducted</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={pfDeducted}
                            onChange={setPfDeducted}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">TDS Deducted</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={tdsDeducted}
                            onChange={setTdsDeducted}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">Official Mail ID Available</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={officialMailAvailable}
                            onChange={setOfficialMailAvailable}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-2 block">Home Loan History / Running</label>
                          <SegmentedToggle
                            options={[
                              { value: "yes", label: "Yes" },
                              { value: "no", label: "No" }
                            ]}
                            value={homeLoanHistory}
                            onChange={setHomeLoanHistory}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10 relative z-10">
                <MagneticButton
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </MagneticButton>

                {currentStep === steps.length ? (
                  <Link href="/results">
                    <MagneticButton variant="accent">
                      Get AI Recommendations
                      <Sparkles className="w-5 h-5" />
                    </MagneticButton>
                  </Link>
                ) : (
                  <MagneticButton variant="primary" onClick={handleNext}>
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* AI Copilot Sidebar */}
        <AICopilotSidebar 
          isOpen={showCopilot} 
          onToggle={() => setShowCopilot(!showCopilot)}
          currentStep={currentStep}
          caseType={caseType}
        />
      </div>
    </main>
  )
}
