"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef } from "react"
import type { Subtitle } from "@/lib/stores/meeting-store"

interface SubtitleFeedProps {
  subtitles: Subtitle[]
}

export function SubtitleFeed({ subtitles }: SubtitleFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new subtitles arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [subtitles])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold">Live Subtitles</h3>
        <p className="text-xs text-gray-400 mt-1">Real-time translations appear here</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          <AnimatePresence>
            {subtitles.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No subtitles yet</p>
                <p className="text-xs mt-1">Start speaking to see translations</p>
              </div>
            ) : (
              subtitles.map((subtitle) => (
                <motion.div
                  key={subtitle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SubtitleItem subtitle={subtitle} formatTime={formatTime} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}

interface SubtitleItemProps {
  subtitle: Subtitle
  formatTime: (timestamp: number) => string
}

function SubtitleItem({ subtitle, formatTime }: SubtitleItemProps) {
  return (
    <Card className="bg-gray-700 border-gray-600 p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {subtitle.participantName}
          </Badge>
          <span className="text-xs text-gray-400">{formatTime(subtitle.timestamp)}</span>
        </div>
      </div>

      {/* Original text */}
      <div className="mb-2">
        <p className="text-xs text-gray-400 mb-1">Original ({subtitle.language}):</p>
        <p className="text-sm text-gray-300 italic">"{subtitle.originalText}"</p>
      </div>

      {/* Translated text */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Translation:</p>
        <p className="text-sm text-white font-medium">"{subtitle.translatedText}"</p>
      </div>
    </Card>
  )
}
