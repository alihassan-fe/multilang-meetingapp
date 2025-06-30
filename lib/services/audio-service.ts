"use client"

import { TTSService } from "./tts-service"
import { toast } from "sonner"

export class AudioService {
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private isRecording = false
  private onAudioData?: (audioBlob: Blob) => void
  private ttsService: TTSService

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    this.ttsService = new TTSService()
  }

  async initialize(onAudioData: (audioBlob: Blob) => void) {
    this.onAudioData = onAudioData

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for Whisper
        },
      })

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
        this.audioChunks = []

        if (this.onAudioData && audioBlob.size > 0) {
          this.onAudioData(audioBlob)
        }
      }

      toast.success("Microphone initialized for live transcription")
      return stream
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      toast.error("Microphone access required for live transcription")
      throw error
    }
  }

  startRecording() {
    if (this.mediaRecorder && !this.isRecording) {
      this.audioChunks = []
      this.mediaRecorder.start(1000) // Capture audio every 1 second
      this.isRecording = true
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
    }
  }

  // Play translated text using TTS
  async playTranslatedText(text: string, language: string) {
    try {
      console.log(`🎧 Playing TTS: "${text}" in ${language}`)

      // Show toast notification
      toast.info(`🔊 Playing: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`, {
        duration: 3000,
      })

      await this.ttsService.speak({
        text,
        language,
        rate: 0.9, // Slightly slower for clarity
        pitch: 1.0,
      })
    } catch (error) {
      console.error("Failed to play TTS:", error)
      toast.error("Audio playback failed")
    }
  }

  // Legacy method for base64 audio (keeping for compatibility)
  async playTranslatedAudio(audioData: string) {
    if (!this.audioContext) return

    try {
      // Convert base64 to array buffer
      const binaryString = atob(audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer)

      // Create and play audio source
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)
      source.start()

      console.log("Playing translated audio")
    } catch (error) {
      console.error("Failed to play translated audio:", error)
      // Fallback to HTML5 audio
      this.playAudioFallback(audioData)
    }
  }

  private playAudioFallback(audioData: string) {
    try {
      const audio = new Audio(`data:audio/wav;base64,${audioData}`)
      audio.play().catch(console.error)
    } catch (error) {
      console.error("Audio playback failed:", error)
    }
  }

  stopTTS() {
    this.ttsService.stop()
  }

  cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.ttsService.stop()
  }
}
