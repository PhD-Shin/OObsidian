import { FC, useState, useEffect, useCallback } from 'react'
import { X, Check, AlertCircle, Loader2, Server, Key, FolderOpen } from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  vaultPath: string | null
  onChangeVault: () => void
}

interface OllamaStatus {
  installed: boolean
  running: boolean
  models: string[]
  error?: string
}

interface ProviderConfig {
  name: string
  key: string
  enabled: boolean
  models: string[]
}

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    placeholder: 'sk-...',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229']
  },
  {
    id: 'groq',
    name: 'Groq',
    placeholder: 'gsk_...',
    models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
  }
]

export const SettingsPanel: FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  vaultPath,
  onChangeVault
}) => {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    installed: false,
    running: false,
    models: []
  })
  const [checkingOllama, setCheckingOllama] = useState(false)
  const [providers, setProviders] = useState<Record<string, ProviderConfig>>({})
  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general')

  const checkOllamaStatus = useCallback(async () => {
    setCheckingOllama(true)
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })

      if (response.ok) {
        const data = await response.json()
        const models = data.models?.map((m: { name: string }) => m.name) || []
        setOllamaStatus({
          installed: true,
          running: true,
          models
        })
      } else {
        setOllamaStatus({
          installed: true,
          running: false,
          models: [],
          error: 'Ollama is not responding'
        })
      }
    } catch {
      setOllamaStatus({
        installed: false,
        running: false,
        models: [],
        error: 'Could not connect to Ollama. Make sure it is installed and running.'
      })
    } finally {
      setCheckingOllama(false)
    }
  }, [])

  // Load saved API keys from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedProviders: Record<string, ProviderConfig> = {}
      PROVIDERS.forEach((p) => {
        const saved = localStorage.getItem(`oobsidian_${p.id}_key`)
        savedProviders[p.id] = {
          name: p.name,
          key: saved || '',
          enabled: !!saved,
          models: p.models
        }
      })
      setProviders(savedProviders)
      checkOllamaStatus()
    }
  }, [isOpen, checkOllamaStatus])

  const handleSaveApiKey = useCallback((providerId: string, key: string) => {
    if (key.trim()) {
      localStorage.setItem(`oobsidian_${providerId}_key`, key.trim())
    } else {
      localStorage.removeItem(`oobsidian_${providerId}_key`)
    }
    setProviders((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        key: key.trim(),
        enabled: !!key.trim()
      }
    }))
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ background: '#141414', border: '1px solid #1f1f1f' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #1f1f1f' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: '#e5e5e5' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: '#666666' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid #1f1f1f' }}>
          <button
            onClick={() => setActiveTab('general')}
            className="px-6 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === 'general' ? '#3b82f6' : '#666666',
              borderBottom: activeTab === 'general' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="px-6 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === 'ai' ? '#3b82f6' : '#666666',
              borderBottom: activeTab === 'ai' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            AI Providers
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Vault Path */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>
                  Vault Location
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 px-3 py-2 rounded text-sm truncate"
                    style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', color: '#e5e5e5' }}
                  >
                    {vaultPath || 'No vault selected'}
                  </div>
                  <button
                    onClick={onChangeVault}
                    className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors"
                    style={{ background: '#1f1f1f', color: '#e5e5e5' }}
                  >
                    <FolderOpen size={16} />
                    Change
                  </button>
                </div>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>
                  Keyboard Shortcuts
                </label>
                <div
                  className="rounded p-4 space-y-2 text-sm"
                  style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
                >
                  <div className="flex justify-between" style={{ color: '#a0a0a0' }}>
                    <span>New File</span>
                    <kbd className="px-2 py-0.5 rounded text-xs" style={{ background: '#1f1f1f' }}>
                      Cmd+N
                    </kbd>
                  </div>
                  <div className="flex justify-between" style={{ color: '#a0a0a0' }}>
                    <span>Open Folder</span>
                    <kbd className="px-2 py-0.5 rounded text-xs" style={{ background: '#1f1f1f' }}>
                      Cmd+O
                    </kbd>
                  </div>
                  <div className="flex justify-between" style={{ color: '#a0a0a0' }}>
                    <span>Toggle AI Chat</span>
                    <kbd className="px-2 py-0.5 rounded text-xs" style={{ background: '#1f1f1f' }}>
                      Cmd+Shift+A
                    </kbd>
                  </div>
                  <div className="flex justify-between" style={{ color: '#a0a0a0' }}>
                    <span>Quick Open</span>
                    <kbd className="px-2 py-0.5 rounded text-xs" style={{ background: '#1f1f1f' }}>
                      Cmd+P
                    </kbd>
                  </div>
                  <div className="flex justify-between" style={{ color: '#a0a0a0' }}>
                    <span>Close Tab</span>
                    <kbd className="px-2 py-0.5 rounded text-xs" style={{ background: '#1f1f1f' }}>
                      Cmd+W
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Ollama Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm font-medium flex items-center gap-2"
                    style={{ color: '#a0a0a0' }}
                  >
                    <Server size={16} />
                    Ollama (Local AI)
                  </label>
                  <button
                    onClick={checkOllamaStatus}
                    disabled={checkingOllama}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ background: '#1f1f1f', color: '#a0a0a0' }}
                  >
                    {checkingOllama ? <Loader2 size={12} className="animate-spin" /> : 'Refresh'}
                  </button>
                </div>
                <div
                  className="rounded p-4"
                  style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {ollamaStatus.running ? (
                      <>
                        <Check size={16} style={{ color: '#22c55e' }} />
                        <span className="text-sm" style={{ color: '#22c55e' }}>
                          Connected
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} style={{ color: '#ef4444' }} />
                        <span className="text-sm" style={{ color: '#ef4444' }}>
                          Not Connected
                        </span>
                      </>
                    )}
                  </div>
                  {ollamaStatus.running && ollamaStatus.models.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs" style={{ color: '#666666' }}>
                        Available models:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ollamaStatus.models.map((model) => (
                          <span
                            key={model}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ background: '#1f1f1f', color: '#a0a0a0' }}
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!ollamaStatus.running && (
                    <p className="text-xs mt-2" style={{ color: '#666666' }}>
                      {ollamaStatus.error ||
                        'Install Ollama from ollama.ai to use local AI models.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Cloud Providers */}
              <div>
                <label
                  className="text-sm font-medium flex items-center gap-2 mb-2"
                  style={{ color: '#a0a0a0' }}
                >
                  <Key size={16} />
                  Cloud Providers
                </label>
                <div className="space-y-3">
                  {PROVIDERS.map((provider) => (
                    <div
                      key={provider.id}
                      className="rounded p-4"
                      style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#e5e5e5' }}>
                          {provider.name}
                        </span>
                        {providers[provider.id]?.enabled && (
                          <Check size={14} style={{ color: '#22c55e' }} />
                        )}
                      </div>
                      <input
                        type="password"
                        placeholder={provider.placeholder}
                        value={providers[provider.id]?.key || ''}
                        onChange={(e) => {
                          setProviders((prev) => ({
                            ...prev,
                            [provider.id]: {
                              ...prev[provider.id],
                              key: e.target.value
                            }
                          }))
                        }}
                        onBlur={(e) => handleSaveApiKey(provider.id, e.target.value)}
                        className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1"
                        style={{
                          background: '#141414',
                          border: '1px solid #1f1f1f',
                          color: '#e5e5e5'
                        }}
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.models.map((model) => (
                          <span
                            key={model}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ background: '#1f1f1f', color: '#666666' }}
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs" style={{ color: '#404040' }}>
                API keys are stored locally on your device. They are never sent to our servers.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4" style={{ borderTop: '1px solid #1f1f1f' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
