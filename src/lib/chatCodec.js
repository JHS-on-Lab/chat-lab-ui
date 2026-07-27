import { encrypt, decrypt } from '@/lib/crypto'

export const encodeMessage = (messageDto) => {
  if (!messageDto?.content) return messageDto

  return {
    ...messageDto,
    content: encrypt(messageDto.content)
  }
}

export const decodeMessage = (messageDto) => {
  if (!messageDto?.content) return messageDto

  return {
    ...messageDto,
    content: decrypt(messageDto.content)
  }
}

export const decodeMessageList = (messages) => {
  return messages.map(decodeMessage)
}