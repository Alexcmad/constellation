"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, MapPin, AlarmClock, Camera, Check } from "lucide-react"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const crimeTypes = [
  { id: "theft", name: "Theft" },
  { id: "assault", name: "Assault" },
  { id: "vandalism", name: "Vandalism" },
  { id: "suspicious", name: "Suspicious Activity" },
  { id: "drugs", name: "Drug Activity" },
  { id: "harassment", name: "Harassment" },
  { id: "other", name: "Other" },
]

const containerStyle = {
  width: "100%",
  height: "300px",
}

export default function ReportIncident() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [reportData, setReportData] = useState({
    crimeType: "",
    description: "",
    location: { lat: 0, lng: 0 },
    timestamp: new Date().toISOString(),
    address: "",
  })

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_API_KEY_PLACEHOLDER", // Replace with actual API key in production
  })

  useEffect(() => {
    if (step === 1) {
      getCurrentLocation()
    }
  }, [step])

  const getCurrentLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(currentLocation)
          setReportData((prev) => ({
            ...prev,
            location: currentLocation,
            timestamp: new Date().toISOString(),
          }))

          // Get address from coordinates (would use Geocoding API in production)
          fetchAddress(currentLocation)
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please try again.",
            variant: "destructive",
          })
          setIsLocating(false)
        },
      )
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      })
      setIsLocating(false)
    }
  }

  const fetchAddress = async (location: { lat: number; lng: number }) => {
    // In a real app, this would call a Geocoding API
    // Here we simulate with a mock address
    setTimeout(() => {
      setReportData((prev) => ({
        ...prev,
        address: "123 Main Street, Anytown, USA",
      }))
    }, 1000)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Validation
    if (!reportData.crimeType) {
      toast({
        title: "Missing information",
        description: "Please select a crime type",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!reportData.description || reportData.description.length < 10) {
      toast({
        title: "Description too short",
        description: "Please provide more details about the incident",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Report Submitted",
        description: "Your incident report has been successfully submitted",
      })

      router.push("/dashboard/map")
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold">Report an Incident</h1>
        <p className="text-muted-foreground mt-1">
          Help keep your community safe by reporting suspicious or criminal activity
        </p>
      </motion.div>

      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === i
                  ? "bg-primary text-primary-foreground"
                  : step > i
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > i ? <Check className="h-5 w-5" /> : i}
            </div>
            <span className="text-xs mt-2">{i === 1 ? "Location" : i === 2 ? "Details" : "Confirm"}</span>
          </motion.div>
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Incident Location</h2>
                <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={isLocating}>
                  {isLocating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Current Location
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Your current location is being used for this report</p>
            </div>

            {location && isLoaded ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border">
                  <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={15}>
                    <Marker position={location} />
                  </GoogleMap>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={reportData.address} readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Location and time are automatically recorded and cannot be edited
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timestamp">Time</Label>
                  <div className="flex items-center">
                    <AlarmClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(reportData.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {isLocating ? (
                    <>
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                      <p className="mt-2">Getting your location...</p>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="mt-2">Location unavailable</p>
                      <Button variant="outline" size="sm" onClick={getCurrentLocation} className="mt-2">
                        Try Again
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={nextStep} disabled={!location}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Incident Details</h2>
              <p className="text-sm text-muted-foreground">Provide information about what you observed</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type of Incident</Label>
                <RadioGroup
                  value={reportData.crimeType}
                  onValueChange={(value) => setReportData({ ...reportData, crimeType: value })}
                  className="grid grid-cols-2 gap-2"
                >
                  {crimeTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id}>{type.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about what you observed..."
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Be as specific as possible. Include relevant details like appearances, vehicle descriptions, or any
                  other identifying information.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Add Photo Evidence (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drag and drop files here or click to upload</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload Photo
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} disabled={!reportData.crimeType || !reportData.description}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Confirm Report</h2>
              <p className="text-sm text-muted-foreground">Please review your report before submitting</p>
            </div>

            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Incident Type</h3>
                  <p>{crimeTypes.find((t) => t.id === reportData.crimeType)?.name || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Date & Time</h3>
                  <p>{new Date(reportData.timestamp).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium">Location</h3>
                  <p>{reportData.address}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="whitespace-pre-line">{reportData.description}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">Submit this report?</p>
                  <p className="text-xs text-muted-foreground">
                    By submitting, you confirm this information is accurate to the best of your knowledge
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  )
}

