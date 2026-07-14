"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  Sparkles, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Lightbulb
} from "lucide-react"
import { GlassCard } from "./glass-card"
import { CircularProgress } from "./circular-progress"
import { cn } from "@/lib/utils"

interface AICopilotSidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentStep: number
  caseType: string
}

const stepTips: Record<number, { title: string; tips: string[]; insight: string }> = {
  1: {
    title: "Personal Details",
    tips: [
      "Ensure your name matches your official documents",
      "Your pincode helps us find region-specific offers",
      "Balance transfer can save you up to 3% on interest"
    ],
    insight: "Users who provide accurate personal details have 23% higher approval rates."
  },
  2: {
    title: "Loan Details",
    tips: [
      "Include all existing EMIs for accurate assessment",
      "Lower outstanding principal increases eligibility",
      "Banks prefer foreclosure-ready loans for BT"
    ],
    insight: "Consolidating multiple loans can improve your debt-to-income ratio by 15%."
  },
  3: {
    title: "Company Details",
    tips: [
      "Pvt Ltd employees get better rates than contractors",
      "Company age > 3 years preferred by most banks",
      "NEFT/RTGS salary credit shows stability"
    ],
    insight: "Employees of companies older than 5 years have 40% higher loan limits."
  },
  4: {
    title: "Credit History",
    tips: [
      "CIBIL score > 750 qualifies for best rates",
      "Keep enquiries < 3 in last 3 months",
      "No bounce in last 6 months is ideal"
    ],
    insight: "A 50-point CIBIL improvement can reduce your interest rate by 0.5-1%."
  },
  5: {
    title: "Salary & Banking",
    tips: [
      "Fixed salary > 50% of total is preferred",
      "PF deduction shows organized sector employment",
      "Home loan history indicates creditworthiness"
    ],
    insight: "Users with official email IDs have 35% faster verification."
  }
}

const recommendations = [
  {
    bank: "HDFC Bank",
    rate: "10.5%",
    probability: 92,
    maxAmount: "₹15,00,000"
  },
  {
    bank: "ICICI Bank",
    rate: "10.75%",
    probability: 88,
    maxAmount: "₹12,00,000"
  },
  {
    bank: "SBI",
    rate: "11.0%",
    probability: 85,
    maxAmount: "₹10,00,000"
  }
]

export function AICopilotSidebar({ isOpen, onToggle, currentStep, caseType }: AICopilotSidebarProps) {
  const [messages, setMessages] = useState<Array<{ type: "ai" | "user"; content: string }>>([
    { type: "ai", content: "Hello! I'm your AI loan assistant. I'll help you find the best loan options based on your profile. Let's start with your personal details." }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const currentTips = stepTips[currentStep] || stepTips[1]

  useEffect(() => {
    // Simulate AI typing when step changes
    setIsTyping(true)
    const timer = setTimeout(() => {
      setIsTyping(false)
      const newMessage = getStepMessage(currentStep, caseType)
      if (newMessage) {
        setMessages(prev => [...prev, { type: "ai", content: newMessage }])
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [currentStep, caseType])

  const getStepMessage = (step: number, type: string): string => {
    const messages: Record<number, string> = {
      1: type === "bt" 
        ? "Great choice on balance transfer! This can help you save significantly on interest. Let me analyze your current loans."
        : "Perfect! A fresh loan application. I'll help you find the best rates available for your profile.",
      2: "Now let's look at your loan requirements. The more details you provide, the more accurate my recommendations will be.",
      3: "Employment details help banks assess your repayment capacity. Stable employment increases your eligibility.",
      4: "Credit history is crucial for loan approval. Don't worry if it's not perfect - I'll still find suitable options for you.",
      5: "Final step! Your income details will help me calculate the maximum loan amount you qualify for."
    }
    return messages[step] || ""
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages(prev => [...prev, { type: "user", content: inputValue }])
    setInputValue("")
    
    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { 
        type: "ai", 
        content: "I understand. Based on what you've told me, I'm optimizing the recommendations. Keep filling out the form for the most accurate results!" 
      }])
    }, 1500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed right-0 top-16 bottom-0 w-80 glass border-l border-white/10 flex flex-col z-20"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">AI Copilot</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Eligibility Prediction */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Eligibility Prediction</span>
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="flex items-center gap-4">
              <CircularProgress value={72} color="primary" size={80} label="Score" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Max Amount</span>
                  <span className="text-white font-medium">₹15L</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Best Rate</span>
                  <span className="text-[#10B981] font-medium">10.5%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Approval</span>
                  <span className="text-[#6366F1] font-medium">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Tips */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-white">{currentTips.title} Tips</span>
            </div>
            <div className="space-y-2">
              {currentTips.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <ChevronRight className="w-3 h-3 mt-0.5 text-[#1B4FBB]" />
                  <span>{tip}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-[#1B4FBB]/10 border border-[#1B4FBB]/20">
              <p className="text-xs text-[#6366F1]">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {currentTips.insight}
              </p>
            </div>
          </div>

          {/* Top Recommendations Preview */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Top Matches</span>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec, index) => (
                <motion.div
                  key={rec.bank}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 rounded-lg glass-card flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-medium text-white">{rec.bank}</p>
                    <p className="text-xs text-muted-foreground">{rec.rate} p.a.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-[#10B981]">{rec.probability}%</p>
                    <p className="text-xs text-muted-foreground">match</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    message.type === "user"
                      ? "bg-[#1B4FBB] text-white rounded-br-md"
                      : "glass text-muted-foreground rounded-bl-md"
                  )}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-1 p-3 glass rounded-2xl rounded-bl-md w-fit">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#6366F1]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#8B5CF6]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#06B6D4]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm focus:outline-none input-glow"
                />
              </div>
              <button
                className="p-3 rounded-xl glass hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                className="p-3 rounded-xl bg-gradient-to-r from-[#1B4FBB] to-[#6366F1] text-white"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
