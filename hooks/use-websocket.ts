"use client"

import { useCallback, useRef, useEffect } from "react"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { AudioService } from "@/lib/services/audio-service"
import { toast } from "sonner"

interface WebSocketMessage {
  type: string
  data: any
  roomId?: string
  participantId?: string
}

// Enhanced mock conversation with realistic translations
const MOCK_CONVERSATION = [
  {
    participantId: "user-1",
    participantName: "Alice Johnson",
    originalText: "How are you doing today?",
    translations: {
      Spanish: "¿Cómo estás hoy?",
      Arabic: "كيف حالك اليوم؟",
      Japanese: "今日はいかがですか？",
      French: "Comment allez-vous aujourd'hui?",
      German: "Wie geht es dir heute?",
    },
    language: "English",
    duration: 3000,
  },
  {
    participantId: "user-2",
    participantName: "Carlos Rodriguez",
    originalText: "Estoy muy bien, gracias por preguntar.",
    translations: {
      English: "I'm doing very well, thank you for asking.",
      Arabic: "أنا بخير جداً، شكراً لك على السؤال.",
      Japanese: "とても元気です、聞いてくれてありがとう。",
      French: "Je vais très bien, merci de demander.",
      German: "Mir geht es sehr gut, danke der Nachfrage.",
    },
    language: "Spanish",
    duration: 3500,
  },
  {
    participantId: "user-3",
    participantName: "Yuki Tanaka",
    originalText: "今日は素晴らしい天気ですね。",
    translations: {
      English: "The weather is wonderful today, isn't it?",
      Spanish: "El clima está maravilloso hoy, ¿no es así?",
      Arabic: "الطقس رائع اليوم، أليس كذلك؟",
      French: "Le temps est magnifique aujourd'hui, n'est-ce pas?",
      German: "Das Wetter ist heute wunderbar, nicht wahr?",
    },
    language: "Japanese",
    duration: 4000,
  },
  {
    participantId: "user-4",
    participantName: "Ahmed Hassan",
    originalText: "نعم، إنه يوم جميل للاجتماع.",
    translations: {
      English: "Yes, it's a beautiful day for a meeting.",
      Spanish: "Sí, es un día hermoso para una reunión.",
      Japanese: "はい、会議には美しい日ですね。",
      French: "Oui, c'est une belle journée pour une réunion.",
      German: "Ja, es ist ein schöner Tag für ein Meeting.",
    },
    language: "Arabic",
    duration: 3200,
  },
  {
    participantId: "user-1",
    participantName: "Alice Johnson",
    originalText: "Let's discuss our project goals for this quarter.",
    translations: {
      Spanish: "Discutamos nuestros objetivos del proyecto para este trimestre.",
      Arabic: "دعونا نناقش أهداف مشروعنا لهذا الربع.",
      Japanese: "今四半期のプロジェクト目標について話し合いましょう。",
      French: "Discutons de nos objectifs de projet pour ce trimestre.",
      German: "Lassen Sie uns unsere Projektziele für dieses Quartal besprechen.",
    },
    language: "English",
    duration: 4000,
  },
  {
    participantId: "user-2",
    participantName: "Carlos Rodriguez",
    originalText: "Perfecto, tengo algunas ideas interesantes para compartir.",
    translations: {
      English: "Perfect, I have some interesting ideas to share.",
      Arabic: "ممتاز، لدي بعض الأفكار المثيرة للاهتمام لمشاركتها.",
      Japanese: "完璧です、共有したい興味深いアイデアがあります。",
      French: "Parfait, j'ai quelques idées intéressantes à partager.",
      German: "Perfekt, ich habe einige interessante Ideen zu teilen.",
    },
    language: "Spanish",
    duration: 3800,
  },
]

const MOCK_PARTICIPANTS = [
  {
    id: "user-1",
    name: "Alice Johnson",
    language: "English",
    originalLanguage: "English",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-2",
    name: "Carlos Rodriguez",
    language: "Spanish",
    originalLanguage: "Spanish",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-3",
    name: "Yuki Tanaka",
    language: "Japanese",
    originalLanguage: "Japanese",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user-4",
    name: "Ahmed Hassan",
    language: "Arabic",
    originalLanguage: "Arabic",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function useWebSocket(roomId: string) {
  const mockInterval = useRef<NodeJS.Timeout | null>(null)
  const conversationIndex = useRef(0)
  const isConnectedRef = useRef(false)
  const audioService = useRef<AudioService | null>(null)

  const { userInfo, setIsConnected, addParticipant, removeParticipant, setCurrentSpeaker, addSubtitle, settings } =
    useMeetingStore()

  const playTranslatedAudio = useCallback(
    async (originalText: string, translatedText: string, targetLanguage: string) => {
      if (!settings.playTranslatedAudio) return

      try {
        // Initialize audio service if not already done
        if (!audioService.current) {
          audioService.current = new AudioService()
        }

        // Play the translated text using TTS
        await audioService.current.playTranslatedText(translatedText, targetLanguage)

        console.log(`🔊 TTS Played: "${translatedText}" in ${targetLanguage}`)
      } catch (error) {
        console.error("Audio playback failed:", error)
      }
    },
    [settings.playTranslatedAudio],
  )

  const simulateParticipantJoining = useCallback(() => {
    MOCK_PARTICIPANTS.forEach((participant, index) => {
      setTimeout(
        () => {
          if (isConnectedRef.current) {
            addParticipant({
              id: participant.id,
              name: participant.name,
              language: participant.language,
              originalLanguage: participant.originalLanguage,
              isAudioEnabled: true,
              isVideoEnabled: false,
              isSpeaking: false,
              avatar: participant.avatar,
            })
            toast.success(`${participant.name} joined the meeting`)
          }
        },
        (index + 1) * 2000,
      )
    })
  }, [addParticipant])

  const simulateConversation = useCallback(() => {
    const playNextMessage = () => {
      if (!isConnectedRef.current) return

      const message = MOCK_CONVERSATION[conversationIndex.current]
      if (!message) {
        // Restart conversation
        conversationIndex.current = 0
        setTimeout(playNextMessage, 5000)
        return
      }

      const participant = MOCK_PARTICIPANTS.find((p) => p.id === message.participantId)
      if (!participant) return

      // Set current speaker
      setCurrentSpeaker({
        id: participant.id,
        name: participant.name,
        language: participant.language,
        originalLanguage: participant.originalLanguage,
        isAudioEnabled: true,
        isVideoEnabled: false,
        isSpeaking: true,
      })

      // Get translation for user's preferred language
      const translatedText = message.translations[settings.preferredLanguage] || message.originalText

      // Add subtitle with delay to simulate real-time transcription
      setTimeout(() => {
        if (isConnectedRef.current) {
          addSubtitle({
            id: `${message.participantId}-${Date.now()}`,
            participantId: message.participantId,
            participantName: message.participantName,
            originalText: message.originalText,
            translatedText: translatedText,
            timestamp: Date.now(),
            language: message.language,
          })

          // Play translated audio using TTS
          playTranslatedAudio(message.originalText, translatedText, settings.preferredLanguage)
        }
      }, 1000)

      // Stop speaking
      setTimeout(() => {
        if (isConnectedRef.current) {
          setCurrentSpeaker(null)
        }
      }, message.duration)

      // Move to next message
      conversationIndex.current = (conversationIndex.current + 1) % MOCK_CONVERSATION.length

      // Schedule next message
      setTimeout(playNextMessage, message.duration + 2000)
    }

    // Start conversation after participants have joined
    setTimeout(playNextMessage, 12000)
  }, [setCurrentSpeaker, addSubtitle, playTranslatedAudio, settings.preferredLanguage])

  const connect = useCallback(() => {
    return new Promise<void>((resolve) => {
      console.log("Connecting to enhanced mock WebSocket with real TTS audio...")

      setTimeout(() => {
        isConnectedRef.current = true
        setIsConnected(true)
        toast.success("Connected to meeting with real TTS audio playback! 🎧")

        // Start simulations
        simulateParticipantJoining()
        simulateConversation()

        resolve()
      }, 1000)
    })
  }, [setIsConnected, simulateParticipantJoining, simulateConversation])

  const send = useCallback((message: WebSocketMessage) => {
    console.log("Mock WebSocket send:", message)

    // Simulate server responses
    if (message.type === "audio-data") {
      // Simulate real-time transcription response
      setTimeout(() => {
        console.log("Simulated transcription response for audio data")
      }, 500)
    }
  }, [])

  const disconnect = useCallback(() => {
    isConnectedRef.current = false
    setIsConnected(false)

    if (mockInterval.current) {
      clearInterval(mockInterval.current)
      mockInterval.current = null
    }

    if (audioService.current) {
      audioService.current.cleanup()
      audioService.current = null
    }

    console.log("Disconnected from enhanced mock WebSocket")
  }, [setIsConnected])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    send,
    disconnect,
    isConnected: isConnectedRef.current,
  }
}
