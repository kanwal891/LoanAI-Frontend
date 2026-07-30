"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, 
  X, 
  Send
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AICopilotSidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentStep: number
  caseType: string
}
export function AICopilotSidebar({ isOpen, onToggle, currentStep, caseType }: AICopilotSidebarProps) {
  const [messages, setMessages] = useState([
  {
    type: "ai",
    content:
      "Hi! 👋 I'm your LoanAI Assistant.\n\nI'll guide you through your loan application and help you understand every field. If you're unsure about anything, just ask me."
  }
])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

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

  const getStepMessage = (step: number, caseType: string): string => {
  switch (step) {
    case 1:
      return "Let's begin with your personal details. Please enter your name, age and pincode."

    case 2:
      return "Now tell me about the loan you're looking for. I'll help explain EMI, interest rate and loan type if needed."

    case 3:
      return "Please provide your employment details. Banks use this information to evaluate loan eligibility."

    case 4:
      return "Now we'll review your credit history. Don't worry if you're unsure about CIBIL or overdue payments—I can explain them."

    case 5:
      return "You're almost done! Fill in your salary details so I can help estimate your eligibility."

    default:
      return ""
  }
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
          className="fixed right-0 top-5 bottom-0 w-80 glass border-l border-white/10 flex flex-col z-20"
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
