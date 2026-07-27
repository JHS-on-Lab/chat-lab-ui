import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { encodeMessage, decodeMessage } from '@/lib/chatCodec'

let stompClient = null
let roomSubscription = null
let userSubscription = null
let isConnected = false

const clearSubscriptions = () => {
  if (userSubscription) {
    userSubscription.unsubscribe()
    userSubscription = null
  }

  if (roomSubscription) {
    roomSubscription.unsubscribe()
    roomSubscription = null
  }
}

const forceLogout = async () => {
  const authStore = useAuthStore()

  isConnected = false
  clearSubscriptions()

  if (stompClient) {
    stompClient.reconnectDelay = 0
    await stompClient.deactivate()
    stompClient = null
  }

  authStore.signout()
}

// const isAuthErrorFrame = (frame) => {
//   const message = frame?.headers?.message ?? ''
//   const body = frame?.body ?? ''
//   const errorText = `${message} ${body}`

//   return (
//     errorText.includes('JWT') ||
//     errorText.includes('Unauthorized') ||
//     errorText.includes('UNAUTHORIZED') ||
//     errorText.includes('Access Denied') ||
//     errorText.includes('Authentication')
//   )
// }

export const connectSocket = () => {
  if (stompClient && stompClient.active) return

  const authStore = useAuthStore()
  const token = authStore.token

  if (!token) {
    forceLogout()
    return
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws/chat'),
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    reconnectDelay: 5000,

    onConnect: () => {
      isConnected = true
      subscribeUserChannel()

      const chatStore = useChatStore()
      if (chatStore.selectedRoomId) {
        subscribeRoom(chatStore.selectedRoomId)
      }
    },

    onStompError: async (frame) => {
      console.error('[STOMP ERROR]', frame)
      isConnected = false

      await forceLogout()
    },

    onWebSocketClose: (e) => {
      isConnected = false
    },

    onWebSocketError: (e) => {
      console.error('[WS ERROR]', e)
      isConnected = false
    },

    splitLargeFrames: true,
    maxWebSocketChunkSize: 8 * 1024
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

export const disconnectSocket = async () => {
  isConnected = false
  clearSubscriptions()

  if (stompClient) {
    stompClient.reconnectDelay = 0
    await stompClient.deactivate()
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