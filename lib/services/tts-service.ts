"use client"

interface TTSOptions {
  text: string
  language: string
  voice?: string
  rate?: number
  pitch?: number
}

export class TTSService {
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isInitialized = false

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
      this.initializeVoices()
    }
  }

  private async initializeVoices() {
    if (!this.synthesis) return

    // Wait for voices to load
    return new Promise<void>((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis!.getVoices()
        if (this.voices.length > 0) {
          this.isInitialized = true
          console.log(`TTS initialized with ${this.voices.length} voices`)
          resolve()
        } else {
          // Retry after a short delay
          setTimeout(loadVoices, 100)
        }
      }

      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = loadVoices
      }
      loadVoices()
    })
  }

  private getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    if (!this.isInitialized || this.voices.length === 0) return null

    // Language code mapping
    const languageMap: Record<string, string[]> = {
      English: ["en-US", "en-GB", "en"],
      Spanish: ["es-ES", "es-MX", "es"],
      French: ["fr-FR", "fr-CA", "fr"],
      German: ["de-DE", "de"],
      Italian: ["it-IT", "it"],
      Portuguese: ["pt-BR", "pt-PT", "pt"],
      Russian: ["ru-RU", "ru"],
      Japanese: ["ja-JP", "ja"],
      Korean: ["ko-KR", "ko"],
      Chinese: ["zh-CN", "zh-TW", "zh"],
      Arabic: ["ar-SA", "ar-EG", "ar"],
      Hindi: ["hi-IN", "hi"],
      Urdu: ["ur-PK", "ur"],
      Turkish: ["tr-TR", "tr"],
      Dutch: ["nl-NL", "nl"],
      Swedish: ["sv-SE", "sv"],
      Norwegian: ["no-NO", "nb-NO", "no"],
      Danish: ["da-DK", "da"],
      Finnish: ["fi-FI", "fi"],
      Polish: ["pl-PL", "pl"],
    }

    const langCodes = languageMap[language] || [language.toLowerCase()]

    // Find the best matching voice
    for (const langCode of langCodes) {
      const voice = this.voices.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()))
      if (voice) {
        console.log(`Found voice for ${language}: ${voice.name} (${voice.lang})`)
        return voice
      }
    }

    // Fallback to default voice
    console.log(`No specific voice found for ${language}, using default`)
    return this.voices[0] || null
  }

  async speak(options: TTSOptions): Promise<void> {
    if (!this.synthesis) {
      console.warn("Speech synthesis not supported")
      return
    }

    // Wait for initialization if needed
    if (!this.isInitialized) {
      await this.initializeVoices()
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.synthesis!.cancel()

        const utterance = new SpeechSynthesisUtterance(options.text)

        // Set voice based on language
        const voice = this.getVoiceForLanguage(options.language)
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang
        } else {
          // Fallback language setting
          utterance.lang = this.getLanguageCode(options.language)
        }

        // Set speech parameters
        utterance.rate = options.rate || 0.9 // Slightly slower for clarity
        utterance.pitch = options.pitch || 1.0
        utterance.volume = 1.0

        // Event handlers
        utterance.onstart = () => {
          console.log(`🔊 Speaking: "${options.text}" in ${options.language}`)
        }

        utterance.onend = () => {
          console.log("✅ Speech completed")
          resolve()
        }

        utterance.onerror = (event) => {
          console.error("❌ Speech error:", event.error)
          reject(new Error(`Speech synthesis error: ${event.error}`))
        }

        // Start speaking
        this.synthesis!.speak(utterance)
      } catch (error) {
        console.error("TTS error:", error)
        reject(error)
      }
    })
  }

  private getLanguageCode(language: string): string {
    const codeMap: Record<string, string> = {
      English: "en-US",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Italian: "it-IT",
      Portuguese: "pt-BR",
      Russian: "ru-RU",
      Japanese: "ja-JP",
      Korean: "ko-KR",
      Chinese: "zh-CN",
      Arabic: "ar-SA",
      Hindi: "hi-IN",
      Urdu: "ur-PK",
      Turkish: "tr-TR",
      Dutch: "nl-NL",
      Swedish: "sv-SE",
      Norwegian: "no-NO",
      Danish: "da-DK",
      Finnish: "fi-FI",
      Polish: "pl-PL",
    }
    return codeMap[language] || "en-US"
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  isSupported(): boolean {
    return this.synthesis !== null
  }
}
