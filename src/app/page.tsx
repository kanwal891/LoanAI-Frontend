"use client"

import { motion } from "framer-motion"
import { 
  Sparkles, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Star,
  Building2,
  ChevronRight,
  Play,
  BarChart3,
  Brain,
  Lock
} from "lucide-react"
import Link from "next/link"
import { GlassNavbar } from "../components/glass-navbar"
import { AuroraBackground } from "../components/aurora-background"
import { GlassCard } from "../components/glass-card"
import { MagneticButton } from "../components/magnetic-button"
import { AnimatedCounter } from "../components/animated-counter"

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const bankLogos = [
  "HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak", "Yes Bank"
]

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our advanced ML models analyze 50+ data points to provide accurate eligibility predictions in seconds."
  },
  {
    icon: Zap,
    title: "Instant Recommendations",
    description: "Get personalized loan recommendations from 20+ banks based on your unique financial profile."
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "256-bit encryption ensures your financial data is protected with enterprise-level security."
  },
  {
    icon: TrendingUp,
    title: "Credit Optimization",
    description: "Receive actionable insights to improve your credit score and increase approval chances."
  }
]

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    company: "Tech Corp",
    content: "LoanAI helped me find the perfect loan in minutes. The AI recommendations were spot-on!",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Business Owner",
    company: "StartupX",
    content: "The eligibility prediction was incredibly accurate. Saved me weeks of research.",
    rating: 5
  },
  {
    name: "Amit Kumar",
    role: "Doctor",
    company: "City Hospital",
    content: "Best loan comparison platform I have used. The interface is beautiful and intuitive.",
    rating: 5
  }
]

const pricingPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for exploring your options",
    features: [
      "Basic eligibility check",
      "Up to 5 bank comparisons",
      "Email support",
      "Basic credit insights"
    ]
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For serious loan seekers",
    popular: true,
    features: [
      "Advanced AI analysis",
      "Unlimited comparisons",
      "Priority support",
      "Credit optimization tips",
      "Document assistance",
      "Rate negotiation help"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For businesses and agents",
    features: [
      "Everything in Pro",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Bulk processing",
      "White-label options"
    ]
  }
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080B14] overflow-x-hidden">
      <GlassNavbar variant="landing" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <AuroraBackground intensity="high" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-sm text-muted-foreground">AI-Powered Loan Intelligence</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance"
            >
              <span className="text-white">Smart Loans.</span>
              <br />
              <span className="gradient-text-primary">Smarter Decisions.</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty"
            >
              Get instant AI-powered loan eligibility assessment and personalized recommendations 
              from 20+ banks. Make informed financial decisions in minutes, not days.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/apply">
                <MagneticButton variant="primary" size="lg">
                  Check Your Eligibility
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <MagneticButton variant="secondary" size="lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </MagneticButton>
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {[
                { value: 98, suffix: "%", label: "Accuracy Rate" },
                { value: 50000, suffix: "+", label: "Happy Users" },
                { value: 20, suffix: "+", label: "Partner Banks" },
                { value: 2, suffix: " Min", label: "Avg. Decision Time" }
              ].map((stat, index) => (
                <GlassCard key={index} className="p-4 text-center" glow>
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </GlassCard>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="glass-card rounded-t-2xl rounded-b-none p-1 shadow-2xl">
            <div className="bg-[#0F1629] rounded-t-xl p-4">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2">Eligibility Score</div>
                  <div className="text-2xl font-bold text-[#10B981]">87%</div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2">Best Rate</div>
                  <div className="text-2xl font-bold text-[#6366F1]">10.5%</div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-xs text-muted-foreground mb-2">Max Amount</div>
                  <div className="text-2xl font-bold text-[#FF6B35]">₹15L</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bank Logos Carousel */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-muted-foreground text-sm mb-8">
            Trusted by leading banks and financial institutions
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            {bankLogos.map((bank, index) => (
              <motion.div
                key={bank}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">{bank}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <AuroraBackground intensity="low" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text-primary">LoanAI</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of loan processing with our AI-driven platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full" glow>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text-accent">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your personalized loan recommendations in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter Your Details", description: "Fill in your basic information and financial details in our smart form.", icon: Users },
              { step: "02", title: "AI Analysis", description: "Our AI analyzes your profile against 50+ parameters across 20+ banks.", icon: Brain },
              { step: "03", title: "Get Recommendations", description: "Receive personalized loan options ranked by approval probability.", icon: BarChart3 }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 text-center" glow glowColor="aurora">
                  <div className="text-6xl font-bold gradient-text-primary opacity-20 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </GlassCard>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-[#6366F1]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative">
        <AuroraBackground intensity="low" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by <span className="gradient-text-primary">Thousands</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 h-full" glow>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FF6B35] text-[#FF6B35]" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">{`"${testimonial.content}"`}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center">
                      <span className="text-white font-medium">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent <span className="gradient-text-accent">Pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={plan.popular ? "md:-mt-4 md:mb-4" : ""}
              >
                <GlassCard 
                  className={`p-6 h-full relative ${plan.popular ? "border-[#1B4FBB] shadow-[0_0_40px_rgba(27,79,187,0.3)]" : ""}`}
                  glow={plan.popular}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#1B4FBB] to-[#6366F1] text-xs font-medium text-white">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton 
                    variant={plan.popular ? "primary" : "secondary"} 
                    className="w-full"
                  >
                    Get Started
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <AuroraBackground intensity="medium" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
              Ready to Find Your Perfect Loan?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 50,000+ users who found their ideal loan with LoanAI
            </p>
            <Link href="/apply">
              <MagneticButton variant="primary" size="lg">
                Start Your Free Assessment
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">LoanAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered loan recommendations for smarter financial decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 LoanAI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Bank-grade security</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
