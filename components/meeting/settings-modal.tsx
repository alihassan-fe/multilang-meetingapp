"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, Languages, Volume2, Subtitles, VolumeX } from "lucide-react"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"
import { toast } from "sonner"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings, subtitles } = useMeetingStore()
  const [tempSettings, setTempSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(tempSettings)
    toast.success("Settings updated - audio preferences applied!")
    onOpenChange(false)
  }

  const handleDownloadTranscript = () => {
    if (subtitles.length === 0) {
      toast.error("No transcript available")
      return
    }

    const transcript = subtitles
      .map(
        (subtitle) =>
          `[${new Date(subtitle.timestamp).toLocaleTimeString()}] ${subtitle.participantName}: ${subtitle.translatedText}`,
      )
      .join("\n")

    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `polymeet-transcript-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Transcript downloaded")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Meeting Settings</span>
          </DialogTitle>
          <DialogDescription>Customize your translation and audio preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Languages className="h-4 w-4" />
                <span>Language Preferences</span>
              </CardTitle>
              <CardDescription>Choose your preferred language for translations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="preferred-language">Preferred Language</Label>
                <Select
                  value={tempSettings.preferredLanguage}
                  onValueChange={(value) => setTempSettings((prev) => ({ ...prev, preferredLanguage: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        <div className="flex items-center space-x-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">All participants will be translated to this language</p>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio Settings</span>
              </CardTitle>
              <CardDescription>Control what audio you hear during the meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="translated-audio">🎧 Play Translated Audio (TTS)</Label>
                  <p className="text-xs text-gray-500">
                    Hear participants speaking in your preferred language using Text-to-Speech
                  </p>
                </div>
                <Switch
                  id="translated-audio"
                  checked={tempSettings.playTranslatedAudio}
                  onCheckedChange={(checked) => setTempSettings((prev) => ({ ...prev, playTranslatedAudio: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="original-audio">🔊 Play Original Audio</Label>
                  <p className="text-xs text-gray-500">Also hear the original speaker's voice (when available)</p>
                </div>
                <Switch
                  id="original-audio"
                  checked={tempSettings.playOriginalAudio}
                  onCheckedChange={(checked) => setTempSettings((prev) => ({ ...prev, playOriginalAudio: checked }))}
                />
              </div>

              {/* TTS Info */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Volume2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Real TTS Audio Playback</span>
                </div>
                <p className="text-xs text-blue-700">
                  When enabled, you'll hear actual speech synthesis of translated text in your headphones. Make sure
                  your volume is up!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subtitle Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Subtitles className="h-4 w-4" />
                <span>Subtitle Settings</span>
              </CardTitle>
              <CardDescription>Configure how subtitles are displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-subtitles">Show Live Subtitles</Label>
                  <p className="text-xs text-gray-500">Display real-time translations on screen</p>
                </div>
                <Switch
                  id="show-subtitles"
                  checked={tempSettings.showSubtitles}
                  onCheckedChange={(checked) => setTempSettings((prev) => ({ ...prev, showSubtitles: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Transcript Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Transcript Settings</span>
              </CardTitle>
              <CardDescription>Manage meeting transcripts and downloads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-download">Auto-download Transcript</Label>
                  <p className="text-xs text-gray-500">Automatically download transcript when meeting ends</p>
                </div>
                <Switch
                  id="auto-download"
                  checked={tempSettings.autoDownloadTranscript}
                  onCheckedChange={(checked) =>
                    setTempSettings((prev) => ({ ...prev, autoDownloadTranscript: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Transcript</p>
                  <p className="text-xs text-gray-500">{subtitles.length} messages recorded</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTranscript}
                  disabled={subtitles.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Current Audio Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-800">Hearing Language</p>
                  <Badge className="mt-1 bg-blue-600">{tempSettings.preferredLanguage}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Audio Mode</p>
                  <div className="mt-1 space-x-1">
                    {tempSettings.playTranslatedAudio ? (
                      <Badge variant="default" className="bg-green-600">
                        <Volume2 className="h-3 w-3 mr-1" />
                        TTS ON
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <VolumeX className="h-3 w-3 mr-1" />
                        TTS OFF
                      </Badge>
                    )}
                    {tempSettings.playOriginalAudio && <Badge variant="secondary">Original</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
