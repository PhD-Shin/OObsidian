import { useState, useEffect, useCallback, useMemo } from 'react'
import { ResizableLayout } from './components/ResizableLayout'
import { Sidebar } from './components/Sidebar'
import { MarkdownEditor } from './components/Editor'
import { ChatSidebar } from './components/ChatSidebar'
import { ActivityBar } from './components/ActivityBar'
import { StatusBar } from './components/StatusBar'
import { SettingsPanel } from './components/SettingsPanel'
import { QuickOpen } from './components/QuickOpen'
import { TabBar, Tab } from './components/TabBar'
import { Backlinks } from './components/Backlinks'
import { FileText, Loader2, FolderOpen } from 'lucide-react'

interface OpenFile {
  path: string
  name: string
  content: string
  isDirty: boolean
}

interface AppState {
  vaultPath: string | null
  activeFile: string | null
  openFiles: OpenFile[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  showChat: boolean
  showSettings: boolean
  showQuickOpen: boolean
  selectedText: string
}

// Empty state when no file is selected
const EmptyEditor = (): JSX.Element => (
  <div
    className="h-full flex flex-col items-center justify-center"
    style={{ background: '#0d0d0d', color: '#666666' }}
  >
    <FileText size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
    <p className="mt-4 text-sm">Select a file to start editing</p>
    <p className="mt-1 text-xs" style={{ color: '#404040' }}>
      or create a new note
    </p>
  </div>
)

// Loading state
const LoadingEditor = (): JSX.Element => (
  <div
    className="h-full flex items-center justify-center"
    style={{ background: '#0d0d0d', color: '#666666' }}
  >
    <Loader2 className="animate-spin" size={24} />
  </div>
)

// Welcome screen when no vault is selected
const WelcomeScreen = ({ onSelectFolder }: { onSelectFolder: () => void }): JSX.Element => (
  <div
    className="h-full flex flex-col items-center justify-center"
    style={{ background: '#0d0d0d', color: '#a0a0a0' }}
  >
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-semibold mb-2" style={{ color: '#e5e5e5' }}>
        Welcome to OObsidian
      </h1>
      <p className="text-sm mb-6" style={{ color: '#666666' }}>
        A local-first markdown editor with AI capabilities
      </p>
      <button
        onClick={onSelectFolder}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors mx-auto"
        style={{ background: '#3b82f6', color: '#fff' }}
      >
        <FolderOpen size={18} />
        Open Vault Folder
      </button>
      <p className="mt-4 text-xs" style={{ color: '#404040' }}>
        Select a folder to use as your vault
      </p>
    </div>
  </div>
)

function App(): JSX.Element {
  const [state, setState] = useState<AppState>({
    vaultPath: null,
    activeFile: null,
    openFiles: [],
    isLoading: false,
    isSaving: false,
    error: null,
    showChat: true,
    showSettings: false,
    showQuickOpen: false,
    selectedText: ''
  })

  const {
    vaultPath,
    activeFile,
    openFiles,
    isLoading,
    isSaving,
    showChat,
    showSettings,
    showQuickOpen,
    selectedText
  } = state

  // Get current file content
  const currentFile = useMemo(() => {
    return openFiles.find((f) => f.path === activeFile)
  }, [openFiles, activeFile])

  const fileContent = currentFile?.content || ''

  // Calculate line and word count
  const { lineCount, wordCount } = useMemo(() => {
    if (!fileContent) return { lineCount: 0, wordCount: 0 }
    const lines = fileContent.split('\n').length
    const words = fileContent.trim().split(/\s+/).filter(Boolean).length
    return { lineCount: lines, wordCount: words }
  }, [fileContent])

  // Convert openFiles to tabs format
  const tabs: Tab[] = useMemo(() => {
    return openFiles.map((f) => ({
      path: f.path,
      name: f.name,
      isDirty: f.isDirty
    }))
  }, [openFiles])

  // Try to load saved vault path on startup, or use default path
  useEffect(() => {
    const initVaultPath = async (): Promise<void> => {
      const savedPath = localStorage.getItem('oobsidian_vault_path')

      if (savedPath) {
        // Verify the path still exists
        try {
          await window.fs.listDir(savedPath)
          setState((prev) => ({ ...prev, vaultPath: savedPath }))
          return
        } catch {
          localStorage.removeItem('oobsidian_vault_path')
        }
      }

      // No saved path or it's invalid - use default path
      try {
        const defaultPath = await window.fs.getDefaultPath()
        localStorage.setItem('oobsidian_vault_path', defaultPath)
        setState((prev) => ({ ...prev, vaultPath: defaultPath }))
      } catch {
        // Failed to get default path - will show welcome screen
      }
    }

    initVaultPath()
  }, [])

  // Watch open files for external changes
  useEffect(() => {
    // Set up file change listener
    window.fs.onFileChanged(async (filePath: string) => {
      // Check if this file is open
      const openFile = state.openFiles.find((f) => f.path === filePath)
      if (openFile && !openFile.isDirty) {
        // File is open and not dirty - reload it
        try {
          const newContent = await window.fs.readFile(filePath)
          setState((prev) => ({
            ...prev,
            openFiles: prev.openFiles.map((f) =>
              f.path === filePath ? { ...f, content: newContent } : f
            )
          }))
        } catch {
          // File might have been deleted
        }
      }
    })

    // Watch all open files
    state.openFiles.forEach((file) => {
      window.fs.watchFile(file.path).catch(() => {})
    })

    return () => {
      // Cleanup: stop watching files
      state.openFiles.forEach((file) => {
        window.fs.unwatchFile(file.path).catch(() => {})
      })
    }
  }, [state.openFiles])

  const handleSelectFolder = useCallback(async () => {
    try {
      const result = await window.fs.selectDirectory()
      if (result) {
        localStorage.setItem('oobsidian_vault_path', result)
        setState((prev) => ({ ...prev, vaultPath: result, activeFile: null, openFiles: [] }))
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to select folder'
      setState((prev) => ({ ...prev, error: errorMessage }))
    }
  }, [])

  const handleFileSelect = useCallback(
    async (path: string) => {
      // Check if file is already open
      const existingFile = state.openFiles.find((f) => f.path === path)
      if (existingFile) {
        setState((prev) => ({ ...prev, activeFile: path }))
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const content = await window.fs.readFile(path)
        const name = path.split('/').pop() || path
        setState((prev) => ({
          ...prev,
          activeFile: path,
          openFiles: [...prev.openFiles, { path, name, content, isDirty: false }],
          isLoading: false
        }))
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to read file'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))
      }
    },
    [state.openFiles]
  )

  const handleContentChange = useCallback(
    async (newContent: string) => {
      if (!activeFile) return

      // Update content in openFiles
      setState((prev) => ({
        ...prev,
        openFiles: prev.openFiles.map((f) =>
          f.path === activeFile ? { ...f, content: newContent, isDirty: true } : f
        ),
        isSaving: true
      }))

      try {
        await window.fs.writeFile(activeFile, newContent)
        setState((prev) => ({
          ...prev,
          openFiles: prev.openFiles.map((f) =>
            f.path === activeFile ? { ...f, isDirty: false } : f
          ),
          isSaving: false
        }))
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to save file'
        setState((prev) => ({ ...prev, isSaving: false, error: errorMessage }))
      }
    },
    [activeFile]
  )

  const handleTabSelect = useCallback((path: string) => {
    setState((prev) => ({ ...prev, activeFile: path }))
  }, [])

  const handleTabClose = useCallback((path: string) => {
    setState((prev) => {
      const newOpenFiles = prev.openFiles.filter((f) => f.path !== path)
      let newActiveFile = prev.activeFile

      // If closing active tab, switch to another tab
      if (prev.activeFile === path) {
        const closingIndex = prev.openFiles.findIndex((f) => f.path === path)
        if (newOpenFiles.length > 0) {
          // Try to select the tab to the left, or the first tab
          newActiveFile = newOpenFiles[Math.max(0, closingIndex - 1)]?.path || null
        } else {
          newActiveFile = null
        }
      }

      return { ...prev, openFiles: newOpenFiles, activeFile: newActiveFile }
    })
  }, [])

  const handleDirSelect = useCallback((path: string) => {
    localStorage.setItem('oobsidian_vault_path', path)
    setState((prev) => ({ ...prev, vaultPath: path }))
  }, [])

  const handleToggleChat = useCallback(() => {
    setState((prev) => ({ ...prev, showChat: !prev.showChat }))
  }, [])

  const handleOpenSettings = useCallback(() => {
    setState((prev) => ({ ...prev, showSettings: true }))
  }, [])

  const handleCloseSettings = useCallback(() => {
    setState((prev) => ({ ...prev, showSettings: false }))
  }, [])

  const handleOpenQuickOpen = useCallback(() => {
    setState((prev) => ({ ...prev, showQuickOpen: true }))
  }, [])

  const handleCloseQuickOpen = useCallback(() => {
    setState((prev) => ({ ...prev, showQuickOpen: false }))
  }, [])

  const handleSelectionChange = useCallback((text: string) => {
    setState((prev) => ({ ...prev, selectedText: text }))
  }, [])

  // Create new file
  const handleCreateNewFile = useCallback(async () => {
    if (!vaultPath) return

    const fileName = `untitled-${Date.now()}.md`
    const filePath = `${vaultPath}/${fileName}`

    try {
      await window.fs.createFile(filePath, '# New Note\n\n')
      handleFileSelect(filePath)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create file'
      setState((prev) => ({ ...prev, error: errorMessage }))
    }
  }, [vaultPath, handleFileSelect])

  // Handle wiki link clicks - navigate to the linked note
  const handleWikiLinkClick = useCallback(
    async (linkName: string) => {
      if (!vaultPath) return

      // Recursively search for a file matching the link name
      const findFile = async (dirPath: string): Promise<string | null> => {
        try {
          const entries = await window.fs.listDir(dirPath)

          for (const entry of entries) {
            // Skip hidden files and common ignored directories
            if (
              entry.name.startsWith('.') ||
              entry.name === 'node_modules' ||
              entry.name === 'dist'
            ) {
              continue
            }

            if (entry.isDirectory) {
              const found = await findFile(entry.path)
              if (found) return found
            } else {
              // Check if filename matches (with or without .md extension)
              const nameWithoutExt = entry.name.replace(/\.md$/, '')
              if (
                nameWithoutExt.toLowerCase() === linkName.toLowerCase() ||
                entry.name.toLowerCase() === linkName.toLowerCase()
              ) {
                return entry.path
              }
            }
          }
        } catch {
          // Ignore errors for individual directories
        }
        return null
      }

      const foundPath = await findFile(vaultPath)

      if (foundPath) {
        handleFileSelect(foundPath)
      } else {
        // File not found - create it
        const newFilePath = `${vaultPath}/${linkName}.md`
        try {
          await window.fs.createFile(newFilePath, `# ${linkName}\n\n`)
          handleFileSelect(newFilePath)
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Failed to create linked note'
          setState((prev) => ({ ...prev, error: errorMessage }))
        }
      }
    },
    [vaultPath, handleFileSelect]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + N: New file
      if (isMod && e.key === 'n') {
        e.preventDefault()
        handleCreateNewFile()
      }

      // Cmd/Ctrl + O: Open folder
      if (isMod && e.key === 'o') {
        e.preventDefault()
        handleSelectFolder()
      }

      // Cmd/Ctrl + Shift + A: Toggle AI chat
      if (isMod && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        handleToggleChat()
      }

      // Cmd/Ctrl + ,: Settings
      if (isMod && e.key === ',') {
        e.preventDefault()
        handleOpenSettings()
      }

      // Cmd/Ctrl + P: Quick Open
      if (isMod && e.key === 'p') {
        e.preventDefault()
        handleOpenQuickOpen()
      }

      // Cmd/Ctrl + W: Close current tab
      if (isMod && e.key === 'w' && activeFile) {
        e.preventDefault()
        handleTabClose(activeFile)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    handleCreateNewFile,
    handleSelectFolder,
    handleToggleChat,
    handleOpenSettings,
    handleOpenQuickOpen,
    handleTabClose,
    activeFile
  ])

  // Show welcome screen if no vault is selected
  if (!vaultPath) {
    return (
      <div className="h-screen w-screen" style={{ background: '#0d0d0d' }}>
        <WelcomeScreen onSelectFolder={handleSelectFolder} />
      </div>
    )
  }

  return (
    <>
      <ResizableLayout
        activityBar={
          <ActivityBar
            showChat={showChat}
            onToggleChat={handleToggleChat}
            onOpenSettings={handleOpenSettings}
          />
        }
        sidebar={
          <Sidebar
            currentPath={vaultPath}
            onDirSelect={handleDirSelect}
            onFileSelect={handleFileSelect}
            selectedFile={activeFile}
          />
        }
        editor={
          <div className="flex flex-col h-full">
            <TabBar
              tabs={tabs}
              activeTab={activeFile}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
            />
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden">
                {isLoading ? (
                  <LoadingEditor />
                ) : activeFile ? (
                  <MarkdownEditor
                    key={activeFile}
                    content={fileContent}
                    filePath={activeFile}
                    onChange={handleContentChange}
                    onLinkClick={handleWikiLinkClick}
                    onSelectionChange={handleSelectionChange}
                  />
                ) : (
                  <EmptyEditor />
                )}
              </div>
              {activeFile && (
                <Backlinks
                  currentFilePath={activeFile}
                  vaultPath={vaultPath}
                  onFileSelect={handleFileSelect}
                />
              )}
            </div>
          </div>
        }
        panel={
          showChat ? (
            <ChatSidebar
              currentFileContent={fileContent}
              currentFileName={currentFile?.name}
              selectedText={selectedText}
            />
          ) : null
        }
        statusBar={
          <StatusBar
            selectedFile={activeFile}
            isSaving={isSaving}
            lineCount={lineCount}
            wordCount={wordCount}
          />
        }
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={handleCloseSettings}
        vaultPath={vaultPath}
        onChangeVault={handleSelectFolder}
      />
      <QuickOpen
        isOpen={showQuickOpen}
        onClose={handleCloseQuickOpen}
        vaultPath={vaultPath}
        onFileSelect={handleFileSelect}
      />
    </>
  )
}

export default App
