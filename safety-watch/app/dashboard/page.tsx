"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Bell, Map, AlertTriangle, UserCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(`/dashboard${path}`)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">Help keep your community safe by reporting and tracking incidents</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/report")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Report Incident</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Report a new incident or suspicious activity in your area</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/map")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Alert Map</CardTitle>
              <Map className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View incidents and hotspots on an interactive map</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/nearby")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Nearby Alerts</CardTitle>
              <Bell className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View alerts near your current location</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo("/profile")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Your Profile</CardTitle>
              <UserCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage your account and view your reports</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8"
      >
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white hover:text-white"
          onClick={() => navigateTo("/report")}
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          Report New Incident
        </Button>
      </motion.div>
    </div>
  )
}

