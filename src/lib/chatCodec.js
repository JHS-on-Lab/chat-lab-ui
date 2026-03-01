import { encrypt, decrypt } from '@/lib/crypto'

export const encodeMessage = async (messageDto) => {
  if (!messageDto?.content) return messageDto

  return {
    ...messageDto,
    content: await encrypt(messageDto.content)
  }
}

export const decodeMessage = async (messageDto) => {
  if (!messageDto?.content) return messageDto

  return {
    ...messageDto,
    content: await decrypt(messageDto.content)
  }
}

export const decodeMessageList = async (messages) => {
  return Promise.all(messages.map(decodeMessage))
}