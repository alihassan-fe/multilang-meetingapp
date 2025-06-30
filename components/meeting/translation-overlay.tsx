"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Volume2, Languages } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMeetingStore } from "@/lib/stores/meeting-store"

export function TranslationOverlay() {
  const { currentSpeaker, settings } = useMeetingStore()

  if (!currentSpeaker || !settings.showSubtitles) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
      >
        <Card className="bg-black/80 backdrop-blur-sm border-gray-600 p-4">
          {/* Speaker info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Badge variant="secondary" className="bg-green-600 text-white">
                <Volume2 className="h-3 w-3 mr-1" />
                {currentSpeaker.name} is speaking
              </Badge>
            </div>

            <Badge variant="outline" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              {currentSpeaker.originalLanguage} → {settings.preferredLanguage}
            </Badge>
          </div>

          {/* Translation status */}
          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-white"
            >
              <p className="text-sm mb-1">🎧 You are hearing this in:</p>
              <p className="text-lg font-semibold text-blue-400">{settings.preferredLanguage}</p>
            </motion.div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center mt-3 space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-blue-500 rounded-full"
                  animate={{ height: [16, 8, 16] }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-300">Live Translation</span>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
