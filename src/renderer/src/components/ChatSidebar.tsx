import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Trash2, Settings2, Bot, User, FileText, MousePointer, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatSidebarProps {
  currentFileContent?: string
  currentFileName?: string
  selectedText?: string
}

type ContextMode = 'none' | 'file' | 'selection'

// OpenAI models (managed by service) - Dec 2025
const AVAILABLE_MODELS = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and efficient (default)' },
  { id: 'gpt-5', name: 'GPT-5', description: 'Most capable model' },
  { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Previous generation' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal model' }
]

const MAX_CONTEXT_MESSAGES = 20

// AI Quick Actions
const AI_ACTIONS = [
  { id: 'summarize', label: 'Summarize', prompt: 'Summarize this text concisely:' },
  { id: 'polish', label: 'Polish', prompt: 'Improve and polish this text while keeping the meaning:' },
  { id: 'translate', label: 'Translate', prompt: 'Translate this to English:' },
  { id: 'todos', label: 'Extract TODOs', prompt: 'Extract action items and TODOs from this text as a bullet list:' }
]

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentFileContent,
  currentFileName,
  selectedText
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini')
  const [showSettings, setShowSettings] = useState(false)
  const [contextMode, setContextMode] = useState<ContextMode>('none')
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

    // Build context based on mode
    let contextPrefix = ''
    if (contextMode === 'file' && currentFileContent) {
      const fileName = currentFileName || 'current file'
      contextPrefix = `[Context: ${fileName}]\n\`\`\`\n${currentFileContent}\n\`\`\`\n\n`
    } else if (contextMode === 'selection' && selectedText) {
      contextPrefix = `[Selected text]\n\`\`\`\n${selectedText}\n\`\`\`\n\n`
    }

    const userContent = contextPrefix ? `${contextPrefix}${input}` : input
    const userMsg: Message = { role: 'user', content: userContent }

    // Show user message without context prefix for cleaner UI
    const displayMsg: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, displayMsg])
    setInput('')
    setIsLoading(true)

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    // Send to backend with context included
    const messagesForAPI = [...messages, userMsg].slice(-MAX_CONTEXT_MESSAGES)
    window.ai.chatStart(messagesForAPI, selectedModel)
  }, [input, isLoading, messages, selectedModel, contextMode, currentFileContent, currentFileName, selectedText])

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

  // Execute AI Action with selected text or current file
  const executeAIAction = useCallback(
    (actionId: string) => {
      const action = AI_ACTIONS.find((a) => a.id === actionId)
      if (!action) return

      const contextText = selectedText || currentFileContent
      if (!contextText) return

      const userContent = `${action.prompt}\n\n\`\`\`\n${contextText}\n\`\`\``
      const userMsg: Message = { role: 'user', content: userContent }

      // Show action label in UI
      const displayMsg: Message = { role: 'user', content: `[${action.label}] ${selectedText ? '(selection)' : currentFileName || 'current file'}` }
      setMessages((prev) => [...prev, displayMsg])
      setIsLoading(true)

      // Add placeholder for assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      // Send to backend
      const messagesForAPI = [...messages, userMsg].slice(-MAX_CONTEXT_MESSAGES)
      window.ai.chatStart(messagesForAPI, selectedModel)
    },
    [selectedText, currentFileContent, currentFileName, messages, selectedModel]
  )

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
        <div className="p-3 space-y-3" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <div>
            <label className="text-xs" style={{ color: '#666666' }}>
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-sm rounded p-2 mt-1 focus:outline-none"
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
          <div>
            <label className="text-xs" style={{ color: '#666666' }}>
              Context
            </label>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => setContextMode('none')}
                className="flex-1 text-xs py-1.5 px-2 rounded transition-colors"
                style={{
                  background: contextMode === 'none' ? '#3b82f6' : '#1a1a1a',
                  color: contextMode === 'none' ? '#fff' : '#666666',
                  border: '1px solid #1f1f1f'
                }}
              >
                None
              </button>
              <button
                onClick={() => setContextMode('file')}
                disabled={!currentFileContent}
                className="flex-1 text-xs py-1.5 px-2 rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-30"
                style={{
                  background: contextMode === 'file' ? '#3b82f6' : '#1a1a1a',
                  color: contextMode === 'file' ? '#fff' : '#666666',
                  border: '1px solid #1f1f1f'
                }}
              >
                <FileText size={12} />
                File
              </button>
              <button
                onClick={() => setContextMode('selection')}
                disabled={!selectedText}
                className="flex-1 text-xs py-1.5 px-2 rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-30"
                style={{
                  background: contextMode === 'selection' ? '#3b82f6' : '#1a1a1a',
                  color: contextMode === 'selection' ? '#fff' : '#666666',
                  border: '1px solid #1f1f1f'
                }}
              >
                <MousePointer size={12} />
                Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Show when there's content available */}
      {(selectedText || currentFileContent) && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <div className="flex items-center gap-1 mb-1.5">
            <Sparkles size={12} style={{ color: '#666666' }} />
            <span className="text-xs" style={{ color: '#666666' }}>
              Quick Actions {selectedText ? '(selection)' : '(file)'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => executeAIAction(action.id)}
                disabled={isLoading}
                className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-30"
                style={{
                  background: '#1a1a1a',
                  color: '#a0a0a0',
                  border: '1px solid #1f1f1f'
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8" style={{ color: '#666666' }}>
            <Bot size={32} strokeWidth={1} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1" style={{ color: '#404040' }}>
              {selectedText || currentFileContent
                ? 'Use Quick Actions above or type a question'
                : 'Start a conversation with AI'}
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
          <span className="flex items-center gap-2">
            {selectedModel}
            {contextMode !== 'none' && (
              <span
                className="px-1.5 py-0.5 rounded text-[10px]"
                style={{ background: '#1f3a5f', color: '#60a5fa' }}
              >
                {contextMode === 'file' ? `+ ${currentFileName || 'file'}` : '+ selection'}
              </span>
            )}
          </span>
          <span>Enter to send</span>
        </div>
      </div>
    </div>
  )
}
