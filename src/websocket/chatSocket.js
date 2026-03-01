import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { encodeMessage, decodeMessage } from '@/lib/chatCodec'

let stompClient = null

export const connectChatSocket = (roomId) => {
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  const socket = new SockJS('/ws/chat')

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${authStore.token}`
    },
    debug: () => {},
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient.subscribe(
        `/topic/chat/rooms/${roomId}`,
        async (message) => {
          const body = JSON.parse(message.body)

          const decoded = await decodeMessage(body.data)

          chatStore.addMessage(roomId, decoded)
        }
      )
    }
  })

  stompClient.activate()
}

export const disconnectChatSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
}

export const sendChatMessage = async (roomId, payload) => {
  if (!stompClient || !stompClient.connected) return

  try {
    const encoded = await encodeMessage(payload)

    stompClient.publish({
      destination: `/app/chat/rooms/${roomId}`,
      body: JSON.stringify(encoded)
    })
  } catch (e) {
    console.error('Message encryption failed', e)
  }
}