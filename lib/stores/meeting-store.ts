import { create } from "zustand"
import { devtools } from "zustand/middleware"

export interface UserInfo {
  name: string
  language: string
  roomId: string
}

export interface Participant {
  id: string
  name: string
  language: string
  originalLanguage: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isSpeaking: boolean
  avatar?: string
}

export interface Subtitle {
  id: string
  participantId: string
  participantName: string
  originalText: string
  translatedText: string
  timestamp: number
  language: string
}

export interface MeetingSettings {
  preferredLanguage: string
  showSubtitles: boolean
  playTranslatedAudio: boolean
  playOriginalAudio: boolean
  autoDownloadTranscript: boolean
}

interface MeetingState {
  // User info
  userInfo: UserInfo | null
  setUserInfo: (info: UserInfo) => void

  // Connection status
  isConnected: boolean
  setIsConnected: (connected: boolean) => void

  // Participants
  participants: Participant[]
  addParticipant: (participant: Participant) => void
  removeParticipant: (participantId: string) => void
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void

  // Current speaker
  currentSpeaker: Participant | null
  setCurrentSpeaker: (participant: Participant | null) => void

  // Subtitles
  subtitles: Subtitle[]
  addSubtitle: (subtitle: Subtitle) => void
  clearSubtitles: () => void

  // Settings
  settings: MeetingSettings
  updateSettings: (updates: Partial<MeetingSettings>) => void

  // Audio/Video controls
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  toggleAudio: () => void
  toggleVideo: () => void

  // Reset store
  reset: () => void
}

const defaultSettings: MeetingSettings = {
  preferredLanguage: "English",
  showSubtitles: true,
  playTranslatedAudio: true,
  playOriginalAudio: false,
  autoDownloadTranscript: false,
}

export const useMeetingStore = create<MeetingState>()(
  devtools(
    (set, get) => ({
      // User info
      userInfo: null,
      setUserInfo: (info) => set({ userInfo: info }),

      // Connection status
      isConnected: false,
      setIsConnected: (connected) => set({ isConnected: connected }),

      // Participants
      participants: [],
      addParticipant: (participant) =>
        set((state) => ({
          participants: [...state.participants, participant],
        })),
      removeParticipant: (participantId) =>
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== participantId),
        })),
      updateParticipant: (participantId, updates) =>
        set((state) => ({
          participants: state.participants.map((p) => (p.id === participantId ? { ...p, ...updates } : p)),
        })),

      // Current speaker
      currentSpeaker: null,
      setCurrentSpeaker: (participant) => set({ currentSpeaker: participant }),

      // Subtitles
      subtitles: [],
      addSubtitle: (subtitle) =>
        set((state) => ({
          subtitles: [...state.subtitles.slice(-50), subtitle], // Keep last 50 subtitles
        })),
      clearSubtitles: () => set({ subtitles: [] }),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // Audio/Video controls
      isAudioEnabled: true,
      isVideoEnabled: false,
      toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
      toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),

      // Reset store
      reset: () =>
        set({
          userInfo: null,
          isConnected: false,
          participants: [],
          currentSpeaker: null,
          subtitles: [],
          settings: defaultSettings,
          isAudioEnabled: true,
          isVideoEnabled: false,
        }),
    }),
    {
      name: "meeting-store",
    },
  ),
)
