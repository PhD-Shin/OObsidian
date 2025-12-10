import { net } from 'electron'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const OLLAMA_BASE_URL = 'http://localhost:11434'
const REQUEST_TIMEOUT = 60000 // 60 seconds

export const streamChat = (
  messages: ChatMessage[],
  model: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): (() => void) => {
  let isAborted = false
  let buffer = '' // Buffer for handling partial JSON chunks

  const request = net.request({
    method: 'POST',
    url: `${OLLAMA_BASE_URL}/api/chat`,
    headers: { 'Content-Type': 'application/json' }
  })

  // Set timeout
  const timeoutId = setTimeout(() => {
    if (!isAborted) {
      isAborted = true
      request.abort()
      onError(new Error('Request timeout: Ollama server did not respond'))
    }
  }, REQUEST_TIMEOUT)

  const body = JSON.stringify({
    model,
    messages,
    stream: true
  })

  request.write(body)

  request.on('response', (response) => {
    clearTimeout(timeoutId)

    if (response.statusCode !== 200) {
      let errorMessage = `Ollama API Error: ${response.statusCode}`
      if (response.statusCode === 404) {
        errorMessage = `Model "${model}" not found. Please ensure Ollama is running and the model is installed.`
      } else if (response.statusCode === 500) {
        errorMessage = 'Ollama server error. Please check if Ollama is running correctly.'
      }
      onError(new Error(errorMessage))
      return
    }

    response.on('data', (chunk) => {
      if (isAborted) return

      // Append new data to buffer
      buffer += chunk.toString()

      // Process complete lines
      const lines = buffer.split('\n')
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue

        try {
          const json = JSON.parse(line)
          if (json.message?.content) {
            onToken(json.message.content)
          }
          if (json.done) {
            onDone()
          }
        } catch {
          // Skip malformed JSON lines silently
        }
      }
    })

    response.on('end', () => {
      // Process any remaining data in buffer
      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer)
          if (json.message?.content) {
            onToken(json.message.content)
          }
          if (json.done) {
            onDone()
          }
        } catch {
          // Ignore final incomplete chunk
        }
      }
    })
  })

  request.on('error', (error) => {
    clearTimeout(timeoutId)
    if (!isAborted) {
      let errorMessage = error.message
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage =
          'Cannot connect to Ollama. Please ensure Ollama is running on localhost:11434'
      }
      onError(new Error(errorMessage))
    }
  })

  request.end()

  return () => {
    isAborted = true
    clearTimeout(timeoutId)
    request.abort()
  }
}
