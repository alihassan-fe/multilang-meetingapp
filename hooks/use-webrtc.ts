"use client"

import { useCallback, useRef, useEffect } from "react"
import { useMeetingStore } from "@/lib/stores/meeting-store"
import { STUN_SERVERS, AUDIO_CONSTRAINTS } from "@/lib/constants"
import { toast } from "sonner"

export function useWebRTC(roomId: string) {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStream = useRef<MediaStream | null>(null)
  const { userInfo, addParticipant, removeParticipant, updateParticipant, isAudioEnabled, isVideoEnabled } =
    useMeetingStore()

  const createPeerConnection = useCallback(
    (participantId: string) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: STUN_SERVERS }],
      })

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("ICE candidate:", event.candidate)
        }
      }

      pc.ontrack = (event) => {
        console.log("Received remote stream from:", participantId)
        const [remoteStream] = event.streams

        // Create audio element for playback
        const audio = new Audio()
        audio.srcObject = remoteStream
        audio.play().catch(console.error)

        updateParticipant(participantId, {
          isAudioEnabled: true,
        })
      }

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState)
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          removeParticipant(participantId)
          peerConnections.current.delete(participantId)
        }
      }

      return pc
    },
    [updateParticipant, removeParticipant],
  )

  const initializeWebRTC = useCallback(async () => {
    try {
      // Check if we're in a browser environment
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        console.log("WebRTC not available in this environment")
        toast.info("Audio features simulated in demo mode")
        return null
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS)
      localStream.current = stream

      // Enable/disable tracks based on settings
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioEnabled
      })

      console.log("Local stream initialized")
      toast.success("Microphone access granted")

      return stream
    } catch (error) {
      console.log("Microphone access denied or not available:", error)
      toast.info("Microphone access denied - using demo mode")
      return null
    }
  }, [isAudioEnabled])

  const createOffer = useCallback(
    async (participantId: string) => {
      const pc = createPeerConnection(participantId)
      peerConnections.current.set(participantId, pc)

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current!)
        })
      }

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        console.log("Created offer for:", participantId)
        return offer
      } catch (error) {
        console.error("Failed to create offer:", error)
        throw error
      }
    },
    [createPeerConnection],
  )

  const handleOffer = useCallback(
    async (participantId: string, offer: RTCSessionDescriptionInit) => {
      const pc = createPeerConnection(participantId)
      peerConnections.current.set(participantId, pc)

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current!)
        })
      }

      try {
        await pc.setRemoteDescription(offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        console.log("Created answer for:", participantId)
        return answer
      } catch (error) {
        console.error("Failed to handle offer:", error)
        throw error
      }
    },
    [createPeerConnection],
  )

  const handleAnswer = useCallback(async (participantId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnections.current.get(participantId)
    if (pc) {
      try {
        await pc.setRemoteDescription(answer)
        console.log("Set remote description for:", participantId)
      } catch (error) {
        console.error("Failed to handle answer:", error)
      }
    }
  }, [])

  const handleIceCandidate = useCallback(async (participantId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(participantId)
    if (pc) {
      try {
        await pc.addIceCandidate(candidate)
        console.log("Added ICE candidate for:", participantId)
      } catch (error) {
        console.error("Failed to add ICE candidate:", error)
      }
    }
  }, [])

  // Update audio track when audio is toggled
  useEffect(() => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = isAudioEnabled
      })
    }
  }, [isAudioEnabled])

  const cleanup = useCallback(() => {
    // Close all peer connections
    peerConnections.current.forEach((pc) => {
      pc.close()
    })
    peerConnections.current.clear()

    // Stop local stream
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop()
      })
      localStream.current = null
    }
  }, [])

  return {
    initializeWebRTC,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup,
  }
}
