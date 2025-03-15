"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Search, AlertTriangle, Calendar, Map, List } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Mock data for crime reports
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

const containerStyle = {
  width: "100%",
  height: "70vh",
}

const defaultCenter = {
  lat: 40.712776,
  lng: -74.005974,
}

interface HotspotData {
  location: { lat: number; lng: number }
  count: number
  radius: number
  color: string
}

export default function AlertMap() {
  const [center, setCenter] = useState(defaultCenter)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRange, setTimeRange] = useState("24h")
  const [showHotspots, setShowHotspots] = useState(true)
  const [reportView, setReportView] = useState<"map" | "list">("map")

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_API_KEY_PLACEHOLDER", // Replace with actual API key in production
  })

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  // Calculate time filter in milliseconds
  const getTimeFilter = () => {
    const now = new Date().getTime()
    switch (timeRange) {
      case "6h":
        return now - 6 * 60 * 60 * 1000
      case "12h":
        return now - 12 * 60 * 60 * 1000
      case "24h":
        return now - 24 * 60 * 60 * 1000
      case "48h":
        return now - 48 * 60 * 60 * 1000
      case "7d":
        return now - 7 * 24 * 60 * 60 * 1000
      default:
        return now - 24 * 60 * 60 * 1000
    }
  }

  // Filter reports based on user selections
  const filteredReports = useMemo(() => {
    const timeFilter = getTimeFilter()

    return mockReports.filter((report) => {
      const matchesType = filterType === "all" || report.type === filterType
      const matchesTime = report.timestamp >= timeFilter
      const matchesSearch =
        searchQuery === "" ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.address.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesType && matchesTime && matchesSearch
    })
  }, [filterType, timeRange, searchQuery])

  // Calculate hotspots
  const hotspots = useMemo(() => {
    const hotspotMap = new Map<string, HotspotData>()

    filteredReports.forEach((report) => {
      // Create a grid cell key based on rounded coordinates
      // This groups reports that are close to each other
      const gridKey = `${Math.round(report.location.lat * 1000) / 1000},${Math.round(report.location.lng * 1000) / 1000}`

      if (hotspotMap.has(gridKey)) {
        const spot = hotspotMap.get(gridKey)!
        spot.count += 1
      } else {
        hotspotMap.set(gridKey, {
          location: report.location,
          count: 1,
          radius: 100, // Default radius
          color: "#FFEB3B", // Default color (yellow)
        })
      }
    })

    // Update radius and color based on count
    return Array.from(hotspotMap.values()).map((spot) => {
      if (spot.count >= 10) {
        spot.color = "#F44336" // Red for 10+
        spot.radius = 300
      } else if (spot.count >= 5) {
        spot.color = "#FF9800" // Orange for 5-9
        spot.radius = 200
      } else {
        spot.color = "#FFEB3B" // Yellow for 1-4
        spot.radius = 100
      }
      return spot
    })
  }, [filteredReports])

  const handleMarkerClick = (reportId: string) => {
    setSelectedReport(reportId)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already reactive, just prevent form submission
  }

  const getMarkerIcon = (reportType: string) => {
    switch (reportType) {
      case "theft":
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
      case "assault":
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
      case "vandalism":
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
      case "suspicious":
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
      case "drugs":
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
      case "harassment":
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
      default:
        return { url: "/placeholder.svg?height=30&width=30", scaledSize: { width: 30, height: 30 } }
    }
  }

  const formatTime = (timestamp: number) => {
    const now = new Date().getTime()
    const diff = now - timestamp

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">Alert Map</h1>
        <p className="text-muted-foreground mt-1">View and analyze crime alerts in your community</p>
      </motion.div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts by location or description"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="vandalism">Vandalism</SelectItem>
                  <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                  <SelectItem value="drugs">Drug Activity</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="12h">Last 12 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="48h">Last 48 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Switch id="hotspots" checked={showHotspots} onCheckedChange={setShowHotspots} />
              <Label htmlFor="hotspots">Show hotspots</Label>
            </div>
            <div className="flex">
              <Tabs value={reportView} onValueChange={(v) => setReportView(v as "map" | "list")}>
                <TabsList>
                  <TabsTrigger value="map">
                    <Map className="h-4 w-4 mr-2" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-2 mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{filteredReports.length} alerts found</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Showing data for:{" "}
                  {timeRange === "6h"
                    ? "last 6 hours"
                    : timeRange === "12h"
                      ? "last 12 hours"
                      : timeRange === "24h"
                        ? "last 24 hours"
                        : timeRange === "48h"
                          ? "last 48 hours"
                          : "last 7 days"}
                </span>
              </div>
            </div>
          </div>

          <TabsContent value="map" className="m-0">
            {isLoaded ? (
              <div className="rounded-lg overflow-hidden border">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={14}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {/* Render markers for each report */}
                  {filteredReports.map((report) => (
                    <Marker
                      key={report.id}
                      position={report.location}
                      onClick={() => handleMarkerClick(report.id)}
                      icon={getMarkerIcon(report.type)}
                      animation={selectedReport === report.id ? 1 : undefined} // 1 is BOUNCE
                    />
                  ))}

                  {/* Render hotspots if enabled */}
                  {showHotspots &&
                    hotspots.map((hotspot, index) => (
                      <Circle
                        key={`hotspot-${index}`}
                        center={hotspot.location}
                        radius={hotspot.radius}
                        options={{
                          strokeColor: hotspot.color,
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: hotspot.color,
                          fillOpacity: 0.35,
                        }}
                      />
                    ))}
                </GoogleMap>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: "70vh" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {selectedReport && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-background rounded-lg border"
              >
                {filteredReports
                  .filter((r) => r.id === selectedReport)
                  .map((report) => (
                    <div key={report.id} className="grid gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{report.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <span
                              className={cn(
                                "inline-block w-2 h-2 rounded-full mr-2",
                                report.type === "theft"
                                  ? "bg-blue-500"
                                  : report.type === "assault"
                                    ? "bg-red-500"
                                    : report.type === "vandalism"
                                      ? "bg-purple-500"
                                      : report.type === "suspicious"
                                        ? "bg-yellow-500"
                                        : report.type === "drugs"
                                          ? "bg-green-500"
                                          : "bg-gray-500",
                              )}
                            ></span>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} •{" "}
                            {formatTime(report.timestamp)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                          Close
                        </Button>
                      </div>
                      <p>{report.description}</p>
                      <div className="text-sm">
                        <strong>Location:</strong> {report.address}
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="list" className="m-0">
            <div className="rounded-lg border overflow-hidden">
              <ScrollArea className="h-[70vh]">
                <div className="divide-y">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "p-4 hover:bg-muted/50 cursor-pointer",
                          selectedReport === report.id && "bg-muted",
                        )}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-medium">{report.title}</h3>
                          <span className="text-xs text-muted-foreground">{formatTime(report.timestamp)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span
                            className={cn(
                              "inline-block w-2 h-2 rounded-full mr-2",
                              report.type === "theft"
                                ? "bg-blue-500"
                                : report.type === "assault"
                                  ? "bg-red-500"
                                  : report.type === "vandalism"
                                    ? "bg-purple-500"
                                    : report.type === "suspicious"
                                      ? "bg-yellow-500"
                                      : report.type === "drugs"
                                        ? "bg-green-500"
                                        : "bg-gray-500",
                            )}
                          ></span>
                          <span className="text-xs text-muted-foreground capitalize">{report.type}</span>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{report.address}</p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p>No alerts found for your current filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <div className="mt-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                <span>1-4 reports</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                <span>5-9 reports</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span>10+ reports</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

