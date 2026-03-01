import DOMPurify from 'dompurify'

const urlRegex =
  /\bhttps?:\/\/[^\s<]+[^\s<.,:;"')\]\s]/gi

const normalizeUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

// 사용자 입력을 먼저 escape (HTML 무력화)
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 링크 변환
export const linkify = (text) => {
  if (typeof text !== 'string') return ''

  return text.replace(urlRegex, (rawUrl) => {
    const href = normalizeUrl(rawUrl)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${rawUrl}</a>`
  })
}

// 최종 포맷터
export const formatMessage = (text) => {
  if (typeof text !== 'string') return ''

  // escape 먼저 수행
  const escaped = escapeHtml(text)

  // URL만 링크화
  const linked = escaped.replace(urlRegex, (rawUrl) => {
    const href = normalizeUrl(rawUrl)
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${rawUrl}</a>`
  })

  // 우리가 만든 <a>만 허용
  return DOMPurify.sanitize(linked, {
    ALLOWED_TAGS: ['a'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}