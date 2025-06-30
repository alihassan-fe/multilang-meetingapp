"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { motion } from "framer-motion"
import type { Participant } from "@/lib/stores/meeting-store"

interface ParticipantGridProps {
  participants: Participant[]
  currentSpeaker: Participant | null
}

export function ParticipantGrid({ participants, currentSpeaker }: ParticipantGridProps) {
  const getGridCols = (count: number) => {
    if (count <= 1) return "grid-cols-1"
    if (count <= 4) return "grid-cols-2"
    if (count <= 9) return "grid-cols-3"
    return "grid-cols-4"
  }

  return (
    <div className={`grid ${getGridCols(participants.length)} gap-4 h-full`}>
      {participants.map((participant) => (
        <motion.div
          key={participant.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <ParticipantCard participant={participant} isCurrentSpeaker={currentSpeaker?.id === participant.id} />
        </motion.div>
      ))}

      {participants.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="h-8 w-8" />
            </div>
            <p>Waiting for participants to join...</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface ParticipantCardProps {
  participant: Participant
  isCurrentSpeaker: boolean
}

function ParticipantCard({ participant, isCurrentSpeaker }: ParticipantCardProps) {
  return (
    <Card
      className={`
      relative h-full min-h-[200px] bg-gray-800 border-gray-700 overflow-hidden
      ${isCurrentSpeaker ? "ring-2 ring-green-500 bg-gray-750" : ""}
    `}
    >
      {/* Speaking indicator */}
      {isCurrentSpeaker && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-green-500 text-white animate-pulse">
            <Volume2 className="h-3 w-3 mr-1" />
            Speaking
          </Badge>
        </div>
      )}

      {/* Audio status */}
      <div className="absolute top-2 right-2 z-10">
        {participant.isAudioEnabled ? (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <MicOff className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-blue-600 text-white text-xl">
            {participant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-lg font-semibold text-white mb-2">{participant.name}</h3>

        <div className="flex flex-col items-center space-y-1">
          <Badge variant="secondary" className="text-xs">
            Speaking: {participant.originalLanguage}
          </Badge>

          {isCurrentSpeaker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-1 text-xs text-green-400"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live translation active</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Audio visualization */}
      {isCurrentSpeaker && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500">
          <motion.div
            className="h-full bg-white"
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      )}
    </Card>
  )
}
