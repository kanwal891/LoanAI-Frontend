"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { cn } from "../lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = ""
}: AnimatedCounterProps) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0
  })
  
  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  return (
    <motion.span 
      ref={ref} 
      className={cn("tabular-nums", className)}
    >
      {display}
    </motion.span>
  )
}
