"use client"

import { toast } from "sonner"

interface TranscriptionResponse {
  text: string
  language: string
  confidence: number
}

interface TranslationResponse {
  translatedText: string
  originalText: string
  sourceLanguage: string
  targetLanguage: string
  audioData?: string // Base64 encoded TTS audio
}

export class WhisperService {
  constructor() {
    // No API key needed on client side anymore
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "audio.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Transcription error:", error)
      toast.error("Transcription failed, using demo mode")
      return this.simulateTranscription(audioBlob)
    }
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<TranslationResponse> {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Generate TTS audio for the translation
      const audioData = await this.generateTTS(data.translatedText, targetLanguage)

      return {
        ...data,
        audioData,
      }
    } catch (error) {
      console.error("Translation error:", error)
      toast.error("Translation failed, using demo mode")
      return this.simulateTranslation(text, sourceLanguage, targetLanguage)
    }
  }

  private async generateTTS(text: string, language: string): Promise<string> {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.audioData
    } catch (error) {
      console.error("TTS error:", error)
      return this.generateMockTTS(text)
    }
  }

  // Demo mode simulations
  private async simulateTranscription(audioBlob: Blob): Promise<TranscriptionResponse> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockTranscriptions = [
      { text: "Hello everyone, how are you doing today?", language: "en" },
      { text: "I'm excited to be part of this international meeting.", language: "en" },
      { text: "Can everyone hear me clearly?", language: "en" },
      { text: "Let's discuss our project timeline.", language: "en" },
      { text: "What are your thoughts on this proposal?", language: "en" },
    ]

    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

    return {
      ...randomTranscription,
      confidence: 0.92,
    }
  }

  private async simulateTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<TranslationResponse> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock translations for demo
    const mockTranslations: Record<string, string> = {
      "Hello everyone, how are you doing today?": "Hola a todos, ¿cómo están hoy?",
      "I'm excited to be part of this international meeting.":
        "Estoy emocionado de ser parte de esta reunión internacional.",
      "Can everyone hear me clearly?": "¿Pueden todos escucharme claramente?",
      "Let's discuss our project timeline.": "Discutamos el cronograma de nuestro proyecto.",
      "What are your thoughts on this proposal?": "¿Cuáles son sus pensamientos sobre esta propuesta?",
    }

    const translatedText = mockTranslations[text] || `[${targetLanguage}] ${text}`
    const audioData = this.generateMockTTS(translatedText)

    return {
      translatedText,
      originalText: text,
      sourceLanguage,
      targetLanguage,
      audioData,
    }
  }

  private generateMockTTS(text: string): string {
    // Generate a simple mock audio data (silence)
    // In a real implementation, this would be actual TTS audio
    const mockAudioData = btoa("mock-audio-data-" + text.length)
    return mockAudioData
  }
}
