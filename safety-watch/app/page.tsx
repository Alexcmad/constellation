"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/login-form"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col flex-1 items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M19 12c0 3.5-2.5 6.5-6 7.5-3.5-1-6-4-6-7.5V8.1c0-.7.4-1.3 1-1.7.6-.4 1.4-.5 2.1-.1L12 7l1.9-.7c.7-.4 1.5-.3 2.1.1.6.4 1 1 1 1.7V12Z" />
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </svg>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl font-bold tracking-tight"
          >
            SafetyWatch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-2 text-muted-foreground"
          >
            Report and track crime alerts in your community
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  )
}

