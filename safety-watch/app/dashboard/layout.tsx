"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Create a mock user for development if none exists
  const mockUser = user || {
    id: "dev-user-123",
    name: "Development User",
    email: "dev@example.com",
    phone: "+1234567890",
    userType: "authority" as const,
  }

  useEffect(() => {
    // Authentication check disabled for development
    // if (!loading && !user) {
    //   router.push("/")
    // }
  }, [user, loading, router])

  // Skip the loading check and always render content
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-4 md:py-6">{children}</main>
    </div>
  )
}

