"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Users, Volume2 } from "lucide-react"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { motion } from "framer-motion"

interface MeetingControlsProps {
  onLeaveMeeting: () => void
  onOpenSettings: () => void
}

export function MeetingControls({ onLeaveMeeting, onOpenSettings }: MeetingControlsProps) {
  const { isAudioEnabled, isVideoEnabled, toggleAudio, toggleVideo, participants, settings } = useMeetingStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between"
    >
      {/* Left side - Participant count and language info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">{participants.length} participants</span>
        </div>

        <Badge variant="secondary" className="bg-blue-600 text-white">
          🎧 Hearing in {settings.preferredLanguage}
        </Badge>

        {settings.playTranslatedAudio && (
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Volume2 className="h-3 w-3 mr-1" />
            Audio ON
          </Badge>
        )}
      </div>

      {/* Center - Main controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0 relative"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          {isAudioEnabled && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "secondary"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
          disabled
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onOpenSettings}
          className="rounded-full w-12 h-12 p-0 bg-transparent"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Button variant="destructive" size="lg" onClick={onLeaveMeeting} className="rounded-full w-12 h-12 p-0">
          <Phone className="h-5 w-5 rotate-[135deg]" />
        </Button>
      </div>

      {/* Right side - Status indicators */}
      <div className="flex items-center space-x-2">
        {!isAudioEnabled && (
          <Badge variant="destructive" className="animate-pulse">
            Muted
          </Badge>
        )}
        {isAudioEnabled && (
          <Badge variant="default" className="bg-green-600">
            🎤 Live STT Active
          </Badge>
        )}
      </div>
    </motion.div>
  )
}
