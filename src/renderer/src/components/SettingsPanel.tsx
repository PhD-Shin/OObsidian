import { FC, useState, useEffect, useCallback } from 'react'
import { X, Check, Key, FolderOpen } from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  vaultPath: string | null
  onChangeVault: () => void
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
    name: 'OpenAI (ChatGPT)',
    placeholder: 'sk-...',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    placeholder: 'sk-ant-...',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229']
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    placeholder: 'AIza...',
    models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
  }
]

export const SettingsPanel: FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  vaultPath,
  onChangeVault
}) => {
  const [providers, setProviders] = useState<Record<string, ProviderConfig>>({})
  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general')

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
    }
  }, [isOpen])

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
              {/* Cloud Providers */}
              <div>
                <label
                  className="text-sm font-medium flex items-center gap-2 mb-2"
                  style={{ color: '#a0a0a0' }}
                >
                  <Key size={16} />
                  AI Providers
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
