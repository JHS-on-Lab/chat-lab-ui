import { encrypt, decrypt } from '@/lib/crypto'

export const encodeFile = (fileDto) => {
  if (!fileDto?.content) return fileDto

  return {
    ...fileDto,
    content: encrypt(fileDto.content)
  }
}

export const decodeFile = (fileDto) => {
  if (!fileDto?.content) return fileDto

  return {
    ...fileDto,
    content: decrypt(fileDto.content)
  }
}

export const decodeFileList = (files) => {
  return files.map(decodeFile)
}
