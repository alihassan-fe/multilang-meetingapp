"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"

export default function LobbyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUserInfo } = useMeetingStore()

  const [name, setName] = useState("")
  const [language, setLanguage] = useState("en")
  const [roomId, setRoomId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const mode = searchParams.get("mode") || "create"

  useEffect(() => {
    // Generate random room ID for create mode
    if (mode === "create") {
      setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase())
    }
  }, [mode])

  const handleJoinMeeting = async () => {
    if (!name.trim() || !language || !roomId.trim()) {
      return
    }

    setIsLoading(true)

    // Set user info in store
    setUserInfo({
      name: name.trim(),
      language,
      roomId: roomId.trim(),
    })

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push(`/meeting/${roomId.trim()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Service Online</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join PolyMeet</CardTitle>
              <CardDescription>Enter your details to start or join a multilingual meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Room Options */}
              <Tabs value={mode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create" onClick={() => router.push("/lobby?mode=create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </TabsTrigger>
                  <TabsTrigger value="join" onClick={() => router.push("/lobby?mode=join")}>
                    <Users className="h-4 w-4 mr-2" />
                    Join Room
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  <div>
                    <Label htmlFor="create-room">Room ID</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="create-room"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        placeholder="Auto-generated"
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase())}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Share this ID with participants</p>
                  </div>
                </TabsContent>

                <TabsContent value="join" className="space-y-4">
                  <div>
                    <Label htmlFor="join-room">Room ID</Label>
                    <Input
                      id="join-room"
                      placeholder="Enter room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      className="mt-1 font-mono"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Language Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">Translation Info</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  You'll hear all participants in{" "}
                  <strong>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || "English"}</strong>. You can
                  change this anytime during the meeting.
                </p>
              </div>

              {/* Join Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleJoinMeeting}
                disabled={!name.trim() || !language || !roomId.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  `${mode === "create" ? "Create & Join" : "Join"} Meeting`
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Use headphones for better audio quality</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Speak clearly for accurate translation</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Allow microphone access when prompted</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
