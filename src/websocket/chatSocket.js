import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { encodeMessage, decodeMessage } from '@/lib/chatCodec'

let stompClient = null
let roomSubscription = null
let userSubscription = null
let isConnected = false

export const connectSocket = () => {
  if (stompClient && stompClient.active) return

  const authStore = useAuthStore()

  const socket = new SockJS('/ws/chat')

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${authStore.token}`
    },
    reconnectDelay: 5000,
    debug: () => {},
    onConnect: () => {
      isConnected = true
      subscribeUserChannel()
      const chatStore = useChatStore()
      if (chatStore.selectedRoomId) {
        subscribeRoom(chatStore.selectedRoomId)
      }
    }
  })

  stompClient.activate()
}

const subscribeUserChannel = () => {
  if (!stompClient || !stompClient.connected) return

  const chatStore = useChatStore()

  userSubscription = stompClient.subscribe(
    '/user/queue/rooms',
    async () => {
      await chatStore.reloadRooms()
    }
  )
}

export const subscribeRoom = (roomId) => {
  if (!stompClient || !isConnected) return

  const chatStore = useChatStore()

  if (roomSubscription) {
    roomSubscription.unsubscribe()
  }

  roomSubscription = stompClient.subscribe(
    `/topic/chat/rooms/${roomId}`,
    async (message) => {
      const body = JSON.parse(message.body)
      const decoded = await decodeMessage(body.data)
      chatStore.addMessage(roomId, decoded)
    }
  )
}

export const unsubscribeRoom = () => {
  if (roomSubscription) {
    roomSubscription.unsubscribe()
    roomSubscription = null
  }
}

export const disconnectSocket = () => {
  if (userSubscription) {
    userSubscription.unsubscribe()
    userSubscription = null
  }

  if (roomSubscription) {
    roomSubscription.unsubscribe()
    roomSubscription = null
  }

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