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
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""
    this.baseUrl = "https://api.openai.com/v1"
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    // In demo mode, simulate transcription
    if (!this.apiKey) {
      return this.simulateTranscription(audioBlob)
    }

    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "audio.webm")
      formData.append("model", "whisper-1")
      formData.append("language", "auto") // Auto-detect language

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        text: data.text,
        language: data.language || "en",
        confidence: 0.95, // Whisper doesn't return confidence, so we estimate
      }
    } catch (error) {
      console.error("Transcription error:", error)
      toast.error("Transcription failed, using demo mode")
      return this.simulateTranscription(audioBlob)
    }
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<TranslationResponse> {
    // In demo mode, simulate translation
    if (!this.apiKey) {
      return this.simulateTranslation(text, sourceLanguage, targetLanguage)
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translation, no explanations.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()
      const translatedText = data.choices[0]?.message?.content || text

      // Generate TTS audio for the translation
      const audioData = await this.generateTTS(translatedText, targetLanguage)

      return {
        translatedText,
        originalText: text,
        sourceLanguage,
        targetLanguage,
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
      const response = await fetch(`${this.baseUrl}/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: this.getVoiceForLanguage(language),
          response_format: "mp3",
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

      return base64Audio
    } catch (error) {
      console.error("TTS error:", error)
      return this.generateMockTTS(text)
    }
  }

  private getVoiceForLanguage(language: string): string {
    const voiceMap: Record<string, string> = {
      en: "alloy",
      es: "nova",
      fr: "shimmer",
      de: "echo",
      it: "fable",
      pt: "onyx",
      ja: "alloy",
      ko: "nova",
      zh: "shimmer",
    }
    return voiceMap[language] || "alloy"
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
