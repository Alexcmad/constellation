"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { AlertCircle, MapPin, Clock, Shield, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Reuse the same mock data from the map page
const mockReports = [
  {
    id: "1",
    type: "theft",
    title: "Bicycle Theft",
    description: "Bicycle stolen from outside the coffee shop",
    location: { lat: 40.712776, lng: -74.005974 },
    timestamp: new Date().getTime() - 3600000, // 1 hour ago
    address: "123 Broadway, New York, NY",
    reportedBy: { id: "user1", name: "John Doe", contact: "555-1234" },
  },
  {
    id: "2",
    type: "suspicious",
    title: "Suspicious Activity",
    description: "Person looking into car windows in parking lot",
    location: { lat: 40.714776, lng: -74.003974 },
    timestamp: new Date().getTime() - 7200000, // 2 hours ago
    address: "456 Main St, New York, NY",
    reportedBy: { id: "user2", name: "Jane Smith", contact: "555-5678" },
  },
  {
    id: "3",
    type: "vandalism",
    title: "Graffiti",
    description: "Graffiti on the side of building",
    location: { lat: 40.715776, lng: -74.008974 },
    timestamp: new Date().getTime() - 10800000, // 3 hours ago
    address: "789 Oak Ave, New York, NY",
    reportedBy: { id: "user3", name: "Bob Johnson", contact: "555-9012" },
  },
  {
    id: "4",
    type: "theft",
    title: "Package Theft",
    description: "Package stolen from front porch",
    location: { lat: 40.710776, lng: -74.007974 },
    timestamp: new Date().getTime() - 14400000, // 4 hours ago
    address: "101 Pine St, New York, NY",
    reportedBy: { id: "user4", name: "Alice Williams", contact: "555-3456" },
  },
  {
    id: "5",
    type: "assault",
    title: "Physical Altercation",
    description: "Fight outside the bar",
    location: { lat: 40.713776, lng: -74.001974 },
    timestamp: new Date().getTime() - 18000000, // 5 hours ago
    address: "202 Elm St, New York, NY",
    reportedBy: { id: "user5", name: "Charlie Brown", contact: "555-7890" },
  },
  {
    id: "6",
    type: "theft",
    title: "Store Shoplifting",
    description: "Individual shoplifting from convenience store",
    location: { lat: 40.715776, lng: -74.001974 },
    timestamp: new Date().getTime() - 21600000, // 6 hours ago
    address: "303 Maple Ave, New York, NY",
    reportedBy: { id: "user6", name: "Diana Miller", contact: "555-1122" },
  },
  {
    id: "7",
    type: "vandalism",
    title: "Car Window Broken",
    description: "Car window smashed, nothing stolen",
    location: { lat: 40.716776, lng: -74.002974 },
    timestamp: new Date().getTime() - 25200000, // 7 hours ago
    address: "404 Birch Rd, New York, NY",
    reportedBy: { id: "user7", name: "Edward Davis", contact: "555-3344" },
  },
  {
    id: "8",
    type: "suspicious",
    title: "Prowler",
    description: "Person prowling around houses at night",
    location: { lat: 40.717776, lng: -74.004974 },
    timestamp: new Date().getTime() - 28800000, // 8 hours ago
    address: "505 Cedar Ln, New York, NY",
    reportedBy: { id: "user8", name: "Fiona Clark", contact: "555-5566" },
  },
  {
    id: "9",
    type: "drugs",
    title: "Drug Deal",
    description: "Possible drug transaction in park",
    location: { lat: 40.711776, lng: -74.002974 },
    timestamp: new Date().getTime() - 32400000, // 9 hours ago
    address: "606 Walnut Pl, New York, NY",
    reportedBy: { id: "user9", name: "George Wilson", contact: "555-7788" },
  },
  {
    id: "10",
    type: "harassment",
    title: "Street Harassment",
    description: "Person verbally harassing pedestrians",
    location: { lat: 40.713776, lng: -74.006974 },
    timestamp: new Date().getTime() - 36000000, // 10 hours ago
    address: "707 Spruce Dr, New York, NY",
    reportedBy: { id: "user10", name: "Hannah Moore", contact: "555-9900" },
  },
  {
    id: "11",
    type: "theft",
    title: "Phone Snatching",
    description: "Phone snatched while walking",
    location: { lat: 40.714776, lng: -74.006974 },
    timestamp: new Date().getTime() - 39600000, // 11 hours ago
    address: "808 Fir Ct, New York, NY",
    reportedBy: { id: "user11", name: "Ian Taylor", contact: "555-1133" },
  },
  {
    id: "12",
    type: "vandalism",
    title: "Broken Storefront",
    description: "Store window smashed",
    location: { lat: 40.715776, lng: -74.005974 },
    timestamp: new Date().getTime() - 43200000, // 12 hours ago
    address: "909 Cherry Blvd, New York, NY",
    reportedBy: { id: "user12", name: "Jessica Adams", contact: "555-4455" },
  },
]

// Function to calculate distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export default function NearbyAlerts() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [radius, setRadius] = useState(5) // Default 5km radius
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Use a default location if geolocation fails
          setUserLocation({
            lat: 40.712776,
            lng: -74.005974,
          })
          setIsLoading(false)
        },
      )
    } else {
      // Use a default location if geolocation is not supported
      setUserLocation({
        lat: 40.712776,
        lng: -74.005974,
      })
      setIsLoading(false)
    }
  }, [])

  // Get time threshold based on filter
  const getTimeThreshold = () => {
    const now = new Date().getTime()
    switch (timeFilter) {
      case "recent":
        return now - 6 * 60 * 60 * 1000 // Last 6 hours
      case "today":
        return now - 24 * 60 * 60 * 1000 // Last 24 hours
      case "week":
        return now - 7 * 24 * 60 * 60 * 1000 // Last week
      default:
        return 0 // All time
    }
  }

  // Filter and sort nearby alerts
  const nearbyAlerts = useMemo(() => {
    if (!userLocation) return []

    const timeThreshold = getTimeThreshold()

    return mockReports
      .filter((report) => {
        // Apply type filter if not "all"
        if (selectedType !== "all" && report.type !== selectedType) return false

        // Apply time filter
        if (report.timestamp < timeThreshold) return false

        // Calculate distance
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          report.location.lat,
          report.location.lng,
        )

        // Only include alerts within the selected radius
        return distance <= radius
      })
      .map((report) => {
        // Add distance property to each report
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          report.location.lat,
          report.location.lng,
        )
        return { ...report, distance }
      })
      .sort((a, b) => a.distance - b.distance) // Sort by distance
  }, [userLocation, radius, selectedType, timeFilter])

  // Format time relative to now
  const formatRelativeTime = (timestamp: number) => {
    const now = new Date().getTime()
    const diff = now - timestamp

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }

  // Get badge color based on alert type
  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case "theft":
        return "bg-blue-500 hover:bg-blue-600"
      case "assault":
        return "bg-red-500 hover:bg-red-600"
      case "vandalism":
        return "bg-purple-500 hover:bg-purple-600"
      case "suspicious":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "drugs":
        return "bg-green-500 hover:bg-green-600"
      case "harassment":
        return "bg-pink-500 hover:bg-pink-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 200px)" }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">Nearby Alerts</h1>
        <p className="text-muted-foreground mt-1">View crime alerts near your current location</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Filter Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Distance Radius: {radius} km</Label>
              <Slider value={[radius]} min={1} max={20} step={1} onValueChange={(value) => setRadius(value[0])} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alert Type</Label>
              <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="theft">Theft</TabsTrigger>
                  <TabsTrigger value="assault">Assault</TabsTrigger>
                  <TabsTrigger value="vandalism">Vandalism</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Tabs value={timeFilter} onValueChange={setTimeFilter}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="all">All Time</TabsTrigger>
                  <TabsTrigger value="recent">Recent (6h)</TabsTrigger>
                  <TabsTrigger value="today">Today (24h)</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium">
                Found {nearbyAlerts.length} alerts within {radius} km
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {userLocation ? "Using your current location" : "Using default location"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Nearby Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearbyAlerts.length > 0 ? (
                nearbyAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={cn(
                        "border hover:border-primary cursor-pointer transition-all",
                        selectedAlert === alert.id && "border-primary ring-1 ring-primary",
                      )}
                      onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <AlertCircle
                              className={cn(
                                "h-5 w-5 mt-1",
                                alert.type === "theft"
                                  ? "text-blue-500"
                                  : alert.type === "assault"
                                    ? "text-red-500"
                                    : alert.type === "vandalism"
                                      ? "text-purple-500"
                                      : alert.type === "suspicious"
                                        ? "text-yellow-500"
                                        : alert.type === "drugs"
                                          ? "text-green-500"
                                          : "text-gray-500",
                              )}
                            />
                            <div>
                              <h3 className="font-medium leading-none mb-1">{alert.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-1">
                                <Badge className={cn("mr-2", getAlertBadgeColor(alert.type))}>{alert.type}</Badge>
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{formatRelativeTime(alert.timestamp)}</span>
                              </div>
                              <p
                                className={cn(
                                  "text-sm line-clamp-2 transition-all",
                                  selectedAlert === alert.id ? "line-clamp-none" : "line-clamp-2",
                                )}
                              >
                                {alert.description}
                              </p>
                              {selectedAlert === alert.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-2 space-y-2"
                                >
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span className="text-muted-foreground">{alert.address}</span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() =>
                                      window.open(
                                        `https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}`,
                                        "_blank",
                                      )
                                    }
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    View on Map
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant="outline" className="mb-1 font-mono">
                              {formatDistance(alert.distance)}
                            </Badge>
                            <ChevronRight
                              className={cn(
                                "h-5 w-5 text-muted-foreground transition-transform",
                                selectedAlert === alert.id && "rotate-90",
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64 flex-col">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No alerts nearby</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    There are no alerts matching your criteria within {radius} km of your location
                  </p>
                  <Button className="mt-4" onClick={() => setRadius(Math.min(radius + 5, 20))}>
                    Increase Search Radius
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <div
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      id={htmlFor}
    >
      {children}
    </div>
  )
}

