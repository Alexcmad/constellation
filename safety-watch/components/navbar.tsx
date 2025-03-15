"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Map, Menu, Shield, UserCircle, AlertTriangle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  // Create a mock user for development if none exists
  const mockUser = user || {
    id: "dev-user-123",
    name: "Development User",
    email: "dev@example.com",
    phone: "+1234567890",
    userType: "authority",
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const menu = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Shield,
    },
    {
      title: "Report Incident",
      href: "/dashboard/report",
      icon: AlertTriangle,
    },
    {
      title: "Alert Map",
      href: "/dashboard/map",
      icon: Map,
    },
    {
      title: "Nearby Alerts",
      href: "/dashboard/nearby",
      icon: Bell,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: UserCircle,
    },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <nav className="grid gap-2 py-6">
              {menu.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-lg font-medium hover:bg-accent rounded-lg",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 text-lg font-medium hover:bg-accent rounded-lg justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-xl hidden md:inline-block">SafetyWatch</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm">
          {menu.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-1 font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center ml-auto">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard/profile")}>
            <UserCircle className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </motion.header>
  )
}

