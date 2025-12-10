import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Trash2, Settings2, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const AVAILABLE_MODELS = [
  { id: 'llama3:8b', name: 'Llama 3 (8B)' },
  { id: 'llama3:70b', name: 'Llama 3 (70B)' },
  { id: 'mistral:7b', name: 'Mistral (7B)' },
  { id: 'codellama:7b', name: 'Code Llama (7B)' },
  { id: 'gemma:7b', name: 'Gemma (7B)' }
]

const MAX_CONTEXT_MESSAGES = 20

export const ChatSidebar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llama3:8b')
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isSubscribedRef = useRef(false)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set up event listeners only once
  useEffect(() => {
    if (isSubscribedRef.current) return
    isSubscribedRef.current = true

    const handleToken = (token: string): void => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: last.content + token }]
        }
        return [...prev, { role: 'assistant', content: token }]
      })
    }

    const handleDone = (): void => {
      setIsLoading(false)
    }

    const handleError = (err: string): void => {
      setIsLoading(false)
      setMessages((prev) => [...prev, { role: 'system', content: `Error: ${err}` }])
    }

    window.ai.onToken(handleToken)
    window.ai.onDone(handleDone)
    window.ai.onError(handleError)

    return () => {
      window.ai.removeAllListeners()
      isSubscribedRef.current = false
    }
  }, [])

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]

    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    // Send to backend with limited context
    window.ai.chatStart(newMessages.slice(-MAX_CONTEXT_MESSAGES), selectedModel)
  }, [input, isLoading, messages, selectedModel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ background: '#141414' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-10"
        style={{ borderBottom: '1px solid #1f1f1f' }}
      >
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#666666' }}>
          AI Chat
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded transition-colors hover:bg-[#1a1a1a]"
            style={{ color: '#666666' }}
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded transition-colors"
            style={{
              color: showSettings ? '#e5e5e5' : '#666666',
              background: showSettings ? '#1a1a1a' : 'transparent'
            }}
            title="Settings"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 space-y-2" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <label className="text-xs" style={{ color: '#666666' }}>
            Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full text-sm rounded p-2 focus:outline-none"
            style={{
              background: '#1a1a1a',
              color: '#e5e5e5',
              border: '1px solid #1f1f1f'
            }}
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8" style={{ color: '#666666' }}>
            <Bot size={32} strokeWidth={1} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1" style={{ color: '#404040' }}>
              Start a conversation with AI
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-2">
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: msg.role === 'user' ? '#3b82f6' : '#1a1a1a',
                color: msg.role === 'user' ? '#fff' : '#a0a0a0'
              }}
            >
              {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            {/* Message */}
            <div
              className="flex-1 text-sm whitespace-pre-wrap"
              style={{
                color:
                  msg.role === 'system' ? '#ef4444' : msg.role === 'user' ? '#e5e5e5' : '#a0a0a0'
              }}
            >
              {msg.content ||
                (msg.role === 'assistant' && isLoading && (
                  <span className="animate-pulse">...</span>
                ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3" style={{ borderTop: '1px solid #1f1f1f' }}>
        <div className="flex gap-2">
          <textarea
            className="flex-1 text-sm rounded p-2 resize-none focus:outline-none"
            style={{
              background: '#1a1a1a',
              color: '#e5e5e5',
              border: '1px solid #1f1f1f'
            }}
            rows={2}
            placeholder="Ask AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-3 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: '#3b82f6',
              color: '#fff'
            }}
          >
            <Send size={14} />
          </button>
        </div>
        <div className="text-xs mt-2 flex justify-between" style={{ color: '#404040' }}>
          <span>{selectedModel}</span>
          <span>Enter to send</span>
        </div>
      </div>
    </div>
  )
}
