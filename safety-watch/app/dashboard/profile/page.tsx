"use client"

import { cn } from "@/lib/utils"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  BellRing,
  Shield,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Map,
  Settings,
  Clock,
  FileText,
} from "lucide-react"

export default function Profile() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    alerts: true,
    reports: true,
    nearbyAlerts: true,
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      })

      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your password",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                <AvatarFallback className="text-xl">{getInitials(user?.name || "User")}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user?.name}</CardTitle>
              <CardDescription>
                {user?.email}
                <br />
                <Badge className="mt-2" variant={user?.userType === "authority" ? "default" : "outline"}>
                  {user?.userType === "authority" ? (
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Authority
                    </div>
                  ) : (
                    "Citizen"
                  )}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="account">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <BellRing className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Clock className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details and personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" required />
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications about alerts and updates
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notificationSettings.email}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, email: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive mobile push notifications</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notificationSettings.push}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, push: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Alert Preferences</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="nearby-notifications">Nearby Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify me about new crime reports near my location
                          </p>
                        </div>
                        <Switch
                          id="nearby-notifications"
                          checked={notificationSettings.nearbyAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, nearbyAlerts: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="alert-notifications">Alert Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Notify me when there are updates to existing alerts
                          </p>
                        </div>
                        <Switch
                          id="alert-notifications"
                          checked={notificationSettings.alerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, alerts: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="report-notifications">My Reports</Label>
                          <p className="text-sm text-muted-foreground">Notify me about activity on my own reports</p>
                        </div>
                        <Switch
                          id="report-notifications"
                          checked={notificationSettings.reports}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, reports: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Notification settings saved",
                        description: "Your notification preferences have been updated",
                      })
                    }}
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>View your recent reports and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Your Reports
                      </h3>

                      <div className="space-y-4">
                        <ActivityItem
                          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          title="Suspicious Activity"
                          description="Person looking into car windows in parking lot"
                          timestamp="2 hours ago"
                          status="Active"
                          statusColor="bg-green-500"
                        />

                        <ActivityItem
                          icon={<AlertTriangle className="h-5 w-5 text-blue-500" />}
                          title="Bicycle Theft"
                          description="Bicycle stolen from outside the coffee shop"
                          timestamp="2 days ago"
                          status="Under Review"
                          statusColor="bg-blue-500"
                        />

                        <ActivityItem
                          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                          title="Car Break-in"
                          description="Car window smashed, items stolen from inside"
                          timestamp="1 week ago"
                          status="Resolved"
                          statusColor="bg-gray-500"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <Map className="mr-2 h-5 w-5" />
                        Location Activity
                      </h3>

                      <div className="space-y-4">
                        <ActivityItem
                          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                          title="Location Updated"
                          description="Your location was updated automatically"
                          timestamp="15 minutes ago"
                        />

                        <ActivityItem
                          icon={<Settings className="h-5 w-5 text-gray-500" />}
                          title="Notification Range Changed"
                          description="Changed alert notification radius to 5km"
                          timestamp="3 days ago"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Complete Activity History
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

// Helper components
function ActivityItem({
  icon,
  title,
  description,
  timestamp,
  status,
  statusColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  timestamp: string
  status?: string
  statusColor?: string
}) {
  return (
    <div className="flex items-start space-x-3 border-l-2 border-muted pl-3 py-1">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{title}</p>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{description}</p>
        {status && (
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusColor}`}></span>
            <span className="text-xs">{status}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Badge({
  children,
  className,
  variant = "outline",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/80",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}

