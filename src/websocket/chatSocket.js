import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'

let stompClient = null

export const connectChatSocket = (roomId) => {
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  const socket = new SockJS('http://localhost:8080/ws/chat')

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
        (message) => {
          const body = JSON.parse(message.body)
          chatStore.addMessage(roomId, body.data)
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

export const sendChatMessage = (roomId, payload) => {
  if (!stompClient || !stompClient.connected) return

  stompClient.publish({
    destination: `/app/chat/rooms/${roomId}`,
    body: JSON.stringify(payload)
  })
}