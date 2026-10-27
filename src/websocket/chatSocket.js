import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { refreshAccessToken } from '@/lib/axios'
import { encodeMessage, decodeMessage } from '@/lib/chatCodec'

let stompClient = null
let roomSubscription = null
let subscribedRoomId = null

const isConnected = () => !!stompClient?.connected

export const connectSocket = () => {
  if (stompClient?.active) return

  const authStore = useAuthStore()
  if (!authStore.token) return

  const client = new Client({
    webSocketFactory: () => new SockJS('/ws/chat'),
    reconnectDelay: 5000,

    // (재)연결 직전마다 토큰을 재발급받아 사용한다.
    // 최초 연결 시점의 토큰을 계속 쓰면 만료 이후 재연결이 항상 실패하기 때문.
    beforeConnect: async () => {
      try {
        const token = await refreshAccessToken()
        client.connectHeaders = { Authorization: `Bearer ${token}` }
      } catch {
        // refresh token 까지 만료 → 재연결 중단 후 로그아웃
        await disconnectSocket()
        authStore.signout()
      }
    },

    onConnect: () => {
      subscribeUserChannels()

      // 재연결 시 기존에 보고 있던 방을 다시 구독
      const chatStore = useChatStore()
      if (chatStore.selectedRoomId) {
        subscribeRoom(chatStore.selectedRoomId)
      }
    },

    // ERROR 프레임 수신 시 서버가 연결을 끊으며, 클라이언트는 reconnectDelay 후 재연결한다.
    onStompError: (frame) => {
      console.error('[STOMP ERROR]', frame.headers?.message, frame.body)
    },

    // 연결이 끊기면 기존 구독은 무효가 되므로 상태를 비워 재연결 시 다시 구독되게 한다.
    onWebSocketClose: () => {
      roomSubscription = null
      subscribedRoomId = null
    },

    onWebSocketError: (e) => {
      console.error('[WS ERROR]', e)
    },

    splitLargeFrames: true,
    maxWebSocketChunkSize: 8 * 1024
  })

  stompClient = client
  client.activate()
}

const subscribeUserChannels = () => {
  const chatStore = useChatStore()

  // 다른 사용자가 나를 방에 초대한 경우
  stompClient.subscribe('/user/queue/rooms', () => {
    chatStore.reloadRooms()
  })

  // 내가 보낸 메시지 처리 실패 알림
  stompClient.subscribe('/user/queue/errors', (message) => {
    const body = JSON.parse(message.body)
    chatStore.setSendError(body.message ?? '메시지 전송에 실패했습니다.')
  })
}

export const subscribeRoom = (roomId) => {
  if (!isConnected()) {
    // 연결 완료(onConnect) 시 selectedRoomId 기준으로 구독된다.
    return
  }

  if (roomSubscription && subscribedRoomId === roomId) return

  unsubscribeRoom()

  const chatStore = useChatStore()

  subscribedRoomId = roomId
  roomSubscription = stompClient.subscribe(
    `/topic/chat/rooms/${roomId}`,
    (message) => {
      const body = JSON.parse(message.body)
      chatStore.addMessage(roomId, decodeMessage(body.data))
    }
  )
}

export const unsubscribeRoom = () => {
  if (roomSubscription && isConnected()) {
    roomSubscription.unsubscribe()
  }
  roomSubscription = null
  subscribedRoomId = null
}

export const disconnectSocket = async () => {
  roomSubscription = null
  subscribedRoomId = null

  if (stompClient) {
    const client = stompClient
    stompClient = null
    await client.deactivate()
  }
}

/**
 * @returns {boolean} 전송 요청 성공 여부 (연결되지 않았으면 false)
 */
export const sendChatMessage = (roomId, payload) => {
  if (!isConnected()) return false

  stompClient.publish({
    destination: `/app/chat/rooms/${roomId}`,
    body: JSON.stringify(encodeMessage(payload))
  })

  return true
}
