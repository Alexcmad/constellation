"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export type UserType = "citizen" | "authority"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  userType: UserType
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, userType: string) => Promise<void>
  register: (name: string, email: string, phone: string, password: string, userType: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulating fetching user from local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user", e)
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  // Mock login function
  const login = async (email: string, password: string, userType: string) => {
    setLoading(true)

    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful login
      if (email && password) {
        const mockUser: User = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          name: email.split("@")[0],
          email,
          phone: "+1234567890",
          userType: userType as UserType,
        }

        setUser(mockUser)
        localStorage.setItem("user", JSON.stringify(mockUser))
        return mockUser
      } else {
        throw new Error("Invalid credentials")
      }
    } finally {
      setLoading(false)
    }
  }

  // Mock register function
  const register = async (name: string, email: string, phone: string, password: string, userType: string) => {
    setLoading(true)

    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful registration
      const mockUser: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        userType: userType as UserType,
      }

      // In a real app, we might not automatically log the user in
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      return mockUser
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

