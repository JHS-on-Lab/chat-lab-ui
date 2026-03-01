const SECRET_KEY = "chatlab-32byte-secret-key-123456"
const FIXED_IV = "chatlabiv123"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

let cachedKey = null

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
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

const normalizeKey = (keyStr) =>
  encoder.encode(keyStr.padEnd(32, "0").slice(0, 32))

const normalizeIv = (ivStr) =>
  encoder.encode(ivStr.padEnd(12, "0").slice(0, 12))

const getCryptoKey = async () => {
  if (cachedKey) return cachedKey

  cachedKey = await crypto.subtle.importKey(
    "raw",
    normalizeKey(SECRET_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  )

  return cachedKey
}

export const encrypt = async (plainText) => {
  if (!plainText) return plainText

  const key = await getCryptoKey()
  const iv = normalizeIv(FIXED_IV)

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText)
  )

  return arrayBufferToBase64(encrypted)
}

export const decrypt = async (cipherText) => {
  if (!cipherText) return cipherText

  const key = await getCryptoKey()
  const iv = normalizeIv(FIXED_IV)

  const bytes = base64ToArrayBuffer(cipherText)

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    bytes
  )

  return decoder.decode(decrypted)
}