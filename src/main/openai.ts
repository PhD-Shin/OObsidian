import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env file manually (no dotenv dependency)
const loadEnvFile = (): void => {
  try {
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim()
          const value = trimmed.slice(eqIndex + 1).trim()
          process.env[key] = value
        }
      }
    }
  } catch {
    // Ignore errors loading .env
  }
}

// Load env on module init
loadEnvFile()

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const REQUEST_TIMEOUT = 120000 // 120 seconds for longer responses

// Get API key from environment
const getApiKey = (): string => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }
  return apiKey
}

// Available models (Dec 2025)
export const OPENAI_MODELS = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and efficient (default)' },
  { id: 'gpt-5', name: 'GPT-5', description: 'Most capable model' },
  { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Previous generation' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal model' }
]

export const streamChatOpenAI = (
  messages: ChatMessage[],
  model: string = 'gpt-5-mini',
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): (() => void) => {
  let isAborted = false
  let buffer = ''
  let req: ReturnType<typeof https.request> | null = null

  let apiKey: string
  try {
    apiKey = getApiKey()
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Failed to get API key'))
    return () => {}
  }

  const body = JSON.stringify({
    model,
    messages,
    stream: true,
    max_completion_tokens: 4096
  })

  const options: https.RequestOptions = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(body)
    }
  }

  // Set timeout
  const timeoutId = setTimeout(() => {
    if (!isAborted) {
      isAborted = true
      req?.destroy()
      onError(new Error('Request timeout: OpenAI API did not respond'))
    }
  }, REQUEST_TIMEOUT)

  req = https.request(options, (response) => {
    clearTimeout(timeoutId)

    if (response.statusCode !== 200) {
      let errorMessage = `OpenAI API Error: ${response.statusCode}`

      // Collect error response body
      let errorBody = ''
      response.on('data', (chunk) => {
        errorBody += chunk.toString()
      })
      response.on('end', () => {
        try {
          const errorJson = JSON.parse(errorBody)
          if (errorJson.error?.message) {
            errorMessage = errorJson.error.message
          }
        } catch {
          // Use default error message
        }

        if (response.statusCode === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.'
        } else if (response.statusCode === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
        } else if (response.statusCode === 500) {
          errorMessage = 'OpenAI server error. Please try again later.'
        }

        onError(new Error(errorMessage))
      })
      return
    }

    response.on('data', (chunk) => {
      if (isAborted) return

      buffer += chunk.toString()

      // Process SSE data lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6) // Remove 'data: ' prefix

        if (data === '[DONE]') {
          onDone()
          return
        }

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            onToken(content)
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    })

    response.on('end', () => {
      // Process remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            onDone()
            return
          }

          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content
            if (content) {
              onToken(content)
            }
          } catch {
            // Ignore
          }
        }
      }
      onDone()
    })
  })

  req.on('error', (error) => {
    clearTimeout(timeoutId)
    if (!isAborted) {
      let errorMessage = error.message
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to OpenAI. Please check your internet connection.'
      }
      onError(new Error(errorMessage))
    }
  })

  req.write(body)
  req.end()

  return () => {
    isAborted = true
    clearTimeout(timeoutId)
    req?.destroy()
  }
}
