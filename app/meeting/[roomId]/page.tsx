"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useWebSocket } from "@/hooks/use-websocket"
import { useLiveTranscription } from "@/hooks/use-live-transcription"
import { MeetingControls } from "@/components/meeting/meeting-controls"
import { ParticipantGrid } from "@/components/meeting/participant-grid"
import { SubtitleFeed } from "@/components/meeting/subtitle-feed"
import { TranslationOverlay } from "@/components/meeting/translation-overlay"
import { SettingsModal } from "@/components/meeting/settings-modal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Wifi, Info, Mic } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const { userInfo, participants, isConnected, currentSpeaker, subtitles, settings, isAudioEnabled } = useMeetingStore()

  const [showSettings, setShowSettings] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  // Initialize WebRTC, WebSocket, and live transcription
  const { initializeWebRTC, cleanup: cleanupWebRTC } = useWebRTC(roomId)
  const { connect, disconnect } = useWebSocket(roomId)
  const { startTranscription, stopTranscription } = useLiveTranscription()

  useEffect(() => {
    // Redirect if no user info
    if (!userInfo) {
      router.push("/lobby")
      return
    }

    // Show enhanced demo info
    toast.info("🎭 Enhanced Demo: Live audio simulation with Whisper STT integration", {
      duration: 5000,
    })

    // Initialize connections
    const initializeConnections = async () => {
      try {
        await connect()
        await initializeWebRTC()

        // Start live transcription for user's speech
        if (isAudioEnabled) {
          await startTranscription()
        }

        setConnectionStatus("connected")
        toast.success("🎤 Live transcription ready - start speaking!")
      } catch (error) {
        console.error("Failed to initialize connections:", error)
        setConnectionStatus("connected") // Still show as connected in demo mode
        toast.info("Running in enhanced demo mode with audio simulation")
      }
    }

    initializeConnections()

    // Cleanup on unmount
    return () => {
      stopTranscription()
      cleanupWebRTC()
      disconnect()
    }
  }, [
    userInfo,
    roomId,
    connect,
    initializeWebRTC,
    cleanupWebRTC,
    disconnect,
    router,
    startTranscription,
    stopTranscription,
    isAudioEnabled,
  ])

  // Handle audio enable/disable for transcription
  useEffect(() => {
    if (isAudioEnabled) {
      startTranscription()
    } else {
      stopTranscription()
    }
  }, [isAudioEnabled, startTranscription, stopTranscription])

  const handleLeaveMeeting = () => {
    stopTranscription()
    cleanupWebRTC()
    disconnect()
    router.push("/")
  }

  if (!userInfo) {
    return null
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave
            </Button>

            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">Room: {roomId}</h1>
              <Badge variant="default" className="bg-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Live Audio Demo
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="h-4 w-4" />
              <span>{participants.length} participants</span>
            </div>

            {isAudioEnabled && (
              <Badge variant="default" className="bg-red-600 animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Live Transcription
              </Badge>
            )}

            <Badge variant="secondary">Hearing in: {settings.preferredLanguage}</Badge>
          </div>
        </div>
      </header>

      {/* Enhanced Demo Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-center text-sm">
        <div className="flex items-center justify-center space-x-2">
          <Info className="h-4 w-4" />
          <span>
            🎭 Enhanced Demo: Whisper STT + Live Audio Simulation |
            {isAudioEnabled ? " 🎤 Speak to see your live transcription" : " Enable mic to test live transcription"}
          </span>
        </div>
      </div>

      {/* Main Meeting Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Participants Grid */}
        <div className="flex-1 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ParticipantGrid participants={participants} currentSpeaker={currentSpeaker} />
          </motion.div>
        </div>

        {/* Side Panel - Translation Info */}
        <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Current Translation Status */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-2">Live Translation Status</h3>
            {currentSpeaker ? (
              <Card className="bg-gray-700 border-gray-600 p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{currentSpeaker.name} is speaking</span>
                </div>
                <p className="text-xs text-gray-300">
                  {currentSpeaker.originalLanguage} → {settings.preferredLanguage}
                </p>
                <div className="mt-2 flex items-center space-x-1">
                  <div className="w-1 h-3 bg-blue-500 rounded animate-pulse"></div>
                  <div className="w-1 h-2 bg-blue-400 rounded animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1 h-4 bg-blue-600 rounded animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <span className="text-xs text-blue-400 ml-2">Audio playing</span>
                </div>
              </Card>
            ) : (
              <div className="text-sm text-gray-400">
                <p>No one is speaking</p>
                {isAudioEnabled && (
                  <p className="text-xs text-green-400 mt-1">🎤 Your mic is active - start speaking!</p>
                )}
              </div>
            )}
          </div>

          {/* Live Subtitles */}
          <div className="flex-1 overflow-hidden">
            <SubtitleFeed subtitles={subtitles} />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <MeetingControls onLeaveMeeting={handleLeaveMeeting} onOpenSettings={() => setShowSettings(true)} />
      </div>

      {/* Translation Overlay */}
      <TranslationOverlay />

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
