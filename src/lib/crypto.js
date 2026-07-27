const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET_KEY

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const xor = (dataBytes, keyBytes) => {
  const result = new Uint8Array(dataBytes.length)

  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length]
  }

  return result
}

const arrayBufferToBase64 = (buffer) => {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary)
}

const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

const keyBytes = encoder.encode(SECRET_KEY)

export const encrypt = (plainText) => {
  if (!plainText) return plainText

  const dataBytes = encoder.encode(plainText)
  const xored = xor(dataBytes, keyBytes)

  return arrayBufferToBase64(xored)
}

export const decrypt = (cipherText) => {
  if (!cipherText) return cipherText

  const dataBytes = base64ToArrayBuffer(cipherText)
  const xored = xor(dataBytes, keyBytes)

  return decoder.decode(xored)
}