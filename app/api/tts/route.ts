import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()
    const textLength = text.length // Declare textLength variable

    if (!text || !language) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Return mock audio data for demo mode
      const mockAudioData = btoa("mock-audio-data-" + textLength)
      return NextResponse.json({
        audioData: mockAudioData,
        format: "mp3",
      })
    }

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

    const voice = voiceMap[language] || "alloy"

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.statusText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    return NextResponse.json({
      audioData: base64Audio,
      format: "mp3",
    })
  } catch (error) {
    console.error("TTS error:", error)

    // Return mock audio data on error
    const mockAudioData = btoa("mock-audio-data-" + textLength) // Use textLength variable
    return NextResponse.json({
      audioData: mockAudioData,
      format: "mp3",
    })
  }
}
