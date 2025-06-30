"use client"

import { useCallback, useRef, useEffect } from "react"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { AudioService } from "@/lib/services/audio-service"
import { WhisperService } from "@/lib/services/whisper-service"
import { toast } from "sonner"

export function useLiveTranscription() {
  const audioService = useRef<AudioService | null>(null)
  const whisperService = useRef<WhisperService | null>(null)
  const isTranscribing = useRef(false)

  const { userInfo, addSubtitle, settings, isAudioEnabled } = useMeetingStore()

  const handleAudioData = useCallback(
    async (audioBlob: Blob) => {
      if (!whisperService.current || !userInfo || isTranscribing.current) return

      isTranscribing.current = true

      try {
        // Transcribe audio using Whisper
        const transcription = await whisperService.current.transcribeAudio(audioBlob)

        if (transcription.text.trim()) {
          // Translate to user's preferred language
          const translation = await whisperService.current.translateText(
            transcription.text,
            transcription.language,
            settings.preferredLanguage.toLowerCase(),
          )

          // Add subtitle to store
          addSubtitle({
            id: `${userInfo.name}-${Date.now()}`,
            participantId: "self",
            participantName: userInfo.name,
            originalText: transcription.text,
            translatedText: translation.translatedText,
            timestamp: Date.now(),
            language: transcription.language,
          })

          // Play translated audio if enabled
          if (settings.playTranslatedAudio && translation.audioData && audioService.current) {
            await audioService.current.playTranslatedAudio(translation.audioData)
          }

          console.log("Live transcription:", {
            original: transcription.text,
            translated: translation.translatedText,
            confidence: transcription.confidence,
          })
        }
      } catch (error) {
        console.error("Live transcription error:", error)
      } finally {
        isTranscribing.current = false
      }
    },
    [userInfo, addSubtitle, settings],
  )

  const startTranscription = useCallback(async () => {
    try {
      audioService.current = new AudioService()
      whisperService.current = new WhisperService()

      await audioService.current.initialize(handleAudioData)
      audioService.current.startRecording()

      toast.success("Live transcription started")
      console.log("Live transcription initialized")
    } catch (error) {
      console.error("Failed to start transcription:", error)
      toast.error("Failed to start live transcription")
    }
  }, [handleAudioData])

  const stopTranscription = useCallback(() => {
    if (audioService.current) {
      audioService.current.stopRecording()
      audioService.current.cleanup()
      audioService.current = null
    }
    whisperService.current = null
    toast.info("Live transcription stopped")
  }, [])

  // Handle audio enable/disable
  useEffect(() => {
    if (isAudioEnabled && audioService.current) {
      audioService.current.startRecording()
    } else if (!isAudioEnabled && audioService.current) {
      audioService.current.stopRecording()
    }
  }, [isAudioEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription()
    }
  }, [stopTranscription])

  return {
    startTranscription,
    stopTranscription,
    isTranscribing: isTranscribing.current,
  }
}
