import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json()

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Return mock translation for demo mode
      const mockTranslations: Record<string, string> = {
        "Hello everyone, how are you doing today?": "Hola a todos, ¿cómo están hoy?",
        "I'm excited to be part of this international meeting.":
          "Estoy emocionado de ser parte de esta reunión internacional.",
        "Can everyone hear me clearly?": "¿Pueden todos escucharme claramente?",
        "Let's discuss our project timeline.": "Discutamos el cronograma de nuestro proyecto.",
        "What are your thoughts on this proposal?": "¿Cuáles son sus pensamientos sobre esta propuesta?",
      }

      const translatedText = mockTranslations[text] || `[${targetLanguage}] ${text}`

      return NextResponse.json({
        translatedText,
        originalText: text,
        sourceLanguage,
        targetLanguage,
      })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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

    return NextResponse.json({
      translatedText,
      originalText: text,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error("Translation error:", error)

    // Return mock translation on error
    const mockTranslations: Record<string, string> = {
      "Hello everyone, how are you doing today?": "Hola a todos, ¿cómo están hoy?",
      "I'm excited to be part of this international meeting.":
        "Estoy emocionado de ser parte de esta reunión internacional.",
      "Can everyone hear me clearly?": "¿Pueden todos escucharme claramente?",
      "Let's discuss our project timeline.": "Discutamos el cronograma de nuestro proyecto.",
      "What are your thoughts on this proposal?": "¿Cuáles son sus pensamientos sobre esta propuesta?",
    }

    const translatedText = mockTranslations[text] || `[${targetLanguage}] ${text}`

    return NextResponse.json({
      translatedText,
      originalText: text,
      sourceLanguage,
      targetLanguage,
    })
  }
}
