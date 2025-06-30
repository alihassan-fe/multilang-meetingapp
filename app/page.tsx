"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Volume2 } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section with Live Demo */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 bg-blue-600 text-white">
              🚀 Real-time AI Translation
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Speak Any Language,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Understand Everyone
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join meetings where language is never a barrier. Real-time translation powered by AI lets you communicate
              naturally with anyone, anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/lobby")}
              >
                Start Meeting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                onClick={() => router.push("/lobby?mode=join")}
              >
                Join Room
              </Button>
            </div>
          </motion.div>

          {/* Live Translation Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Mock Meeting Interface */}
                <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900">
                  {/* Mock Participants */}
                  <div className="absolute inset-4 grid grid-cols-2 gap-4">
                    {/* Participant 1 - Speaking */}
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0 0px rgba(34, 197, 94, 0.4)",
                          "0 0 0 10px rgba(34, 197, 94, 0)",
                          "0 0 0 0px rgba(34, 197, 94, 0.4)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center relative border-2 border-green-500"
                    >
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white font-semibold text-lg">AJ</span>
                      </div>
                      <p className="text-white font-medium text-sm">Alice Johnson</p>
                      <Badge className="mt-1 bg-green-600 text-xs">🇺🇸 Speaking</Badge>

                      {/* Speaking indicator */}
                      <div className="absolute top-2 right-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                          className="w-3 h-3 bg-green-500 rounded-full"
                        />
                      </div>
                    </motion.div>

                    {/* Participant 2 */}
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white font-semibold text-lg">CR</span>
                      </div>
                      <p className="text-white font-medium text-sm">Carlos Rodriguez</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        🇪🇸 Listening
                      </Badge>
                    </div>

                    {/* Participant 3 */}
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white font-semibold text-lg">YT</span>
                      </div>
                      <p className="text-white font-medium text-sm">Yuki Tanaka</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        🇯🇵 Listening
                      </Badge>
                    </div>

                    {/* Participant 4 */}
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white font-semibold text-lg">AH</span>
                      </div>
                      <p className="text-white font-medium text-sm">Ahmed Hassan</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        🇸🇦 Listening
                      </Badge>
                    </div>
                  </div>

                  {/* Live Translation Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute bottom-4 left-4 right-4"
                  >
                    <Card className="bg-black/80 backdrop-blur-sm border-blue-500/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <span className="text-green-400 text-sm font-medium">Alice is speaking</span>
                          </div>
                          <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                            EN → ES
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="text-gray-300 text-sm">
                            <span className="text-gray-500">Original:</span> "Hello everyone, welcome to our meeting
                            today!"
                          </div>
                          <div className="text-white text-sm font-medium">
                            <span className="text-blue-400">Translation:</span> "¡Hola a todos, bienvenidos a nuestra
                            reunión de hoy!"
                          </div>
                        </div>

                        {/* Audio visualization */}
                        <div className="flex items-center space-x-1 mt-3">
                          <Volume2 className="h-4 w-4 text-blue-400" />
                          <div className="flex space-x-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1 h-4 bg-blue-500 rounded-full"
                                animate={{ height: [16, 8, 16, 12, 16] }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-blue-400 ml-2">Playing in Spanish</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Floating language indicators */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute top-4 right-4"
                  >
                    <Badge className="bg-blue-600 text-white">Live Translation</Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
