import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Loader2,
  FileText,
  Plus,
  FolderPlus,
  Trash2,
  Pencil
} from 'lucide-react'

interface FileItem {
  name: string
  isDirectory: boolean
  path: string
  children?: FileItem[]
}

interface SidebarProps {
  onFileSelect: (path: string) => void
  onDirSelect: (path: string) => void
  currentPath: string
  selectedFile: string | null
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  item: FileItem | null
  isRoot: boolean
}

// Hidden/system folders to filter out
const HIDDEN_PATTERNS = [
  /^\./, // dot files/folders
  /^node_modules$/,
  /^__pycache__$/,
  /^dist$/,
  /^build$/,
  /^out$/,
  /^coverage$/
]

const shouldHideItem = (name: string): boolean => {
  return HIDDEN_PATTERNS.some((pattern) => pattern.test(name))
}

// Only show markdown and PDF files (document files)
const isDocumentFile = (name: string): boolean => {
  const lower = name.toLowerCase()
  return lower.endsWith('.md') || lower.endsWith('.pdf')
}

// Get file icon based on extension
const getFileIcon = (name: string): JSX.Element => {
  const lower = name.toLowerCase()
  if (lower.endsWith('.md')) {
    return <FileText size={14} style={{ color: '#22c55e' }} />
  }
  if (lower.endsWith('.pdf')) {
    return <FileText size={14} style={{ color: '#ef4444' }} />
  }
  return <File size={14} style={{ color: '#666666' }} />
}

// Context Menu Component
const ContextMenu: React.FC<{
  state: ContextMenuState
  onClose: () => void
  onNewFile: (parentPath: string) => void
  onNewFolder: (parentPath: string) => void
  onDelete: (item: FileItem) => void
  onRename: (item: FileItem) => void
}> = ({ state, onClose, onNewFile, onNewFolder, onDelete, onRename }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!state.visible) return null

  const parentPath = state.isRoot
    ? state.item?.path || ''
    : state.item?.isDirectory
      ? state.item.path
      : state.item?.path.split('/').slice(0, -1).join('/') || ''

  return (
    <div
      ref={menuRef}
      className="fixed z-50 py-1 rounded-md shadow-lg min-w-[160px]"
      style={{
        left: state.x,
        top: state.y,
        background: '#1a1a1a',
        border: '1px solid #2a2a2a'
      }}
    >
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-white/10"
        style={{ color: '#e5e5e5' }}
        onClick={() => {
          onNewFile(parentPath)
          onClose()
        }}
      >
        <Plus size={14} />
        New File
      </button>
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-white/10"
        style={{ color: '#e5e5e5' }}
        onClick={() => {
          onNewFolder(parentPath)
          onClose()
        }}
      >
        <FolderPlus size={14} />
        New Folder
      </button>
      {state.item && !state.isRoot && (
        <>
          <div className="my-1" style={{ borderTop: '1px solid #2a2a2a' }} />
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-white/10"
            style={{ color: '#e5e5e5' }}
            onClick={() => {
              onRename(state.item!)
              onClose()
            }}
          >
            <Pencil size={14} />
            Rename
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-white/10"
            style={{ color: '#ef4444' }}
            onClick={() => {
              onDelete(state.item!)
              onClose()
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </>
      )}
    </div>
  )
}

// Inline Rename Input Component
const InlineInput: React.FC<{
  defaultValue: string
  onSubmit: (value: string) => void
  onCancel: () => void
  placeholder?: string
}> = ({ defaultValue, onSubmit, onCancel, placeholder }) => {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== defaultValue) {
      onSubmit(trimmed)
    } else {
      onCancel()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSubmit()
        if (e.key === 'Escape') onCancel()
      }}
      placeholder={placeholder}
      className="w-full px-1 py-0.5 text-sm rounded"
      style={{
        background: '#0d0d0d',
        border: '1px solid #3b82f6',
        color: '#e5e5e5',
        outline: 'none'
      }}
    />
  )
}

const FileTreeItem: React.FC<{
  item: FileItem
  onFileSelect: (path: string) => void
  level: number
  selectedPath?: string
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void
  renamingPath: string | null
  onRenameSubmit: (oldPath: string, newName: string) => void
  onRenameCancel: () => void
}> = ({
  item,
  onFileSelect,
  level,
  selectedPath,
  onContextMenu,
  renamingPath,
  onRenameSubmit,
  onRenameCancel
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [children, setChildren] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelected = selectedPath === item.path
  const isRenaming = renamingPath === item.path

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!item.isDirectory) {
        onFileSelect(item.path)
        return
      }

      if (isOpen) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
        if (children.length === 0) {
          setLoading(true)
          setError(null)
          try {
            const items = await window.fs.listDir(item.path)
            const filtered = items.filter((i) => {
              if (shouldHideItem(i.name)) return false
              // Show directories and document files (md, pdf) only
              return i.isDirectory || isDocumentFile(i.name)
            })
            const sorted = filtered.sort((a, b) => {
              if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
              return a.isDirectory ? -1 : 1
            })
            setChildren(sorted)
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load'
            setError(message)
          } finally {
            setLoading(false)
          }
        }
      }
    },
    [item, isOpen, children.length, onFileSelect]
  )

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(e, item)
  }

  const renderIcon = (): JSX.Element => {
    if (item.isDirectory) {
      return isOpen ? (
        <FolderOpen size={14} style={{ color: '#f59e0b' }} />
      ) : (
        <Folder size={14} style={{ color: '#f59e0b' }} />
      )
    }
    return getFileIcon(item.name)
  }

  return (
    <div>
      <div
        className="flex items-center cursor-pointer py-1 text-sm transition-colors"
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          paddingRight: '8px',
          background: isSelected ? '#1a1a1a' : 'transparent',
          color: isSelected ? '#e5e5e5' : '#a0a0a0'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = '#141414'
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent'
        }}
        onClick={handleToggle}
        onContextMenu={handleContextMenu}
      >
        <span className="mr-1 w-4 flex items-center justify-center" style={{ color: '#666666' }}>
          {item.isDirectory && (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
        </span>
        <span className="mr-2 flex-shrink-0">{renderIcon()}</span>
        {isRenaming ? (
          <InlineInput
            defaultValue={item.name}
            onSubmit={(newName) => onRenameSubmit(item.path, newName)}
            onCancel={onRenameCancel}
          />
        ) : (
          <span className="truncate">{item.name}</span>
        )}
      </div>
      {isOpen && (
        <div>
          {loading && (
            <div
              className="flex items-center gap-2 text-xs py-1"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px`, color: '#666666' }}
            >
              <Loader2 size={12} className="animate-spin" />
              Loading...
            </div>
          )}
          {error && (
            <div
              className="text-xs py-1"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px`, color: '#ef4444' }}
            >
              {error}
            </div>
          )}
          {children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              onFileSelect={onFileSelect}
              level={level + 1}
              selectedPath={selectedPath}
              onContextMenu={onContextMenu}
              renamingPath={renamingPath}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
            />
          ))}
          {!loading && !error && children.length === 0 && (
            <div
              className="text-xs italic py-1"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px`, color: '#404040' }}
            >
              Empty
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, currentPath, selectedFile }) => {
  const [rootItems, setRootItems] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    isRoot: false
  })
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [newItemState, setNewItemState] = useState<{
    type: 'file' | 'folder'
    parentPath: string
  } | null>(null)

  const loadRoot = useCallback(async () => {
    if (!currentPath) return

    setLoading(true)
    setError(null)

    try {
      const items = await window.fs.listDir(currentPath)
      const filtered = items.filter((i) => {
        if (shouldHideItem(i.name)) return false
        // Show directories and document files (md, pdf) only
        return i.isDirectory || isDocumentFile(i.name)
      })
      const sorted = filtered.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
        return a.isDirectory ? -1 : 1
      })
      setRootItems(sorted)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load directory'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [currentPath])

  useEffect(() => {
    loadRoot()
  }, [loadRoot])

  // Watch directory for changes and auto-refresh
  useEffect(() => {
    if (!currentPath) return

    // Set up directory watcher
    window.fs.watchDir(currentPath).catch(() => {
      // Silently fail if watch is not supported
    })

    // Listen for directory changes
    window.fs.onDirChanged((event) => {
      // Only reload if the change is in our watched directory
      if (event.dirPath === currentPath || event.filename) {
        loadRoot()
      }
    })

    return () => {
      // Cleanup: stop watching and remove listeners
      window.fs.unwatchDir(currentPath).catch(() => {})
      window.fs.removeFileWatchListeners()
    }
  }, [currentPath, loadRoot])

  const handleFileSelect = useCallback(
    (path: string) => {
      onFileSelect(path)
    },
    [onFileSelect]
  )

  const handleContextMenu = useCallback((e: React.MouseEvent, item: FileItem) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      isRoot: false
    })
  }, [])

  const handleRootContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        item: { name: '', path: currentPath, isDirectory: true },
        isRoot: true
      })
    },
    [currentPath]
  )

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleNewFile = useCallback((parentPath: string) => {
    setNewItemState({ type: 'file', parentPath })
  }, [])

  const handleNewFolder = useCallback((parentPath: string) => {
    setNewItemState({ type: 'folder', parentPath })
  }, [])

  const handleNewItemSubmit = useCallback(
    async (name: string) => {
      if (!newItemState) return

      const fullPath = `${newItemState.parentPath}/${name}`

      try {
        if (newItemState.type === 'file') {
          const fileName = name.endsWith('.md') ? name : `${name}.md`
          const filePath = `${newItemState.parentPath}/${fileName}`
          await window.fs.createFile(filePath, '')
          onFileSelect(filePath)
        } else {
          await window.fs.createDir(fullPath)
        }
        loadRoot()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create'
        console.error(message)
      } finally {
        setNewItemState(null)
      }
    },
    [newItemState, loadRoot, onFileSelect]
  )

  const handleDelete = useCallback(
    async (item: FileItem) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${item.name}"?${item.isDirectory ? '\n\nThis will delete all contents inside.' : ''}`
      )

      if (!confirmed) return

      try {
        if (item.isDirectory) {
          // For directories, we need to delete recursively
          // For now, just try to delete (will fail if not empty)
          // TODO: Implement recursive delete
          await window.fs.deleteFile(item.path)
        } else {
          await window.fs.deleteFile(item.path)
        }
        loadRoot()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete'
        console.error(message)
        alert(`Failed to delete: ${message}`)
      }
    },
    [loadRoot]
  )

  const handleRename = useCallback((item: FileItem) => {
    setRenamingPath(item.path)
  }, [])

  const handleRenameSubmit = useCallback(
    async (oldPath: string, newName: string) => {
      const parentPath = oldPath.split('/').slice(0, -1).join('/')
      const newPath = `${parentPath}/${newName}`

      try {
        await window.fs.renameFile(oldPath, newPath)
        loadRoot()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to rename'
        console.error(message)
        alert(`Failed to rename: ${message}`)
      } finally {
        setRenamingPath(null)
      }
    },
    [loadRoot]
  )

  const handleRenameCancel = useCallback(() => {
    setRenamingPath(null)
  }, [])

  // Get the folder name from path
  const folderName = currentPath.split('/').filter(Boolean).pop() || 'Vault'

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: '#141414' }}
      onContextMenu={handleRootContextMenu}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-10 text-xs font-medium uppercase tracking-wide"
        style={{ color: '#666666', borderBottom: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center gap-2">
          <Folder size={12} style={{ color: '#f59e0b' }} />
          <span className="truncate">{folderName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNewFile(currentPath)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="New File"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => handleNewFolder(currentPath)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-auto py-1">
        {/* New item input at root level */}
        {newItemState && newItemState.parentPath === currentPath && (
          <div className="flex items-center py-1 px-2" style={{ paddingLeft: '8px' }}>
            <span className="mr-2">
              {newItemState.type === 'file' ? (
                <FileText size={14} style={{ color: '#22c55e' }} />
              ) : (
                <Folder size={14} style={{ color: '#f59e0b' }} />
              )}
            </span>
            <InlineInput
              defaultValue=""
              onSubmit={handleNewItemSubmit}
              onCancel={() => setNewItemState(null)}
              placeholder={newItemState.type === 'file' ? 'filename.md' : 'folder name'}
            />
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8" style={{ color: '#666666' }}>
            <Loader2 className="animate-spin" size={18} />
          </div>
        )}
        {error && (
          <div className="p-4 text-xs" style={{ color: '#ef4444' }}>
            <p>{error}</p>
            <button
              onClick={loadRoot}
              className="mt-2 underline hover:no-underline"
              style={{ color: '#3b82f6' }}
            >
              Retry
            </button>
          </div>
        )}
        {!loading &&
          !error &&
          rootItems.map((item) => (
            <FileTreeItem
              key={item.path}
              item={item}
              onFileSelect={handleFileSelect}
              level={0}
              selectedPath={selectedFile ?? undefined}
              onContextMenu={handleContextMenu}
              renamingPath={renamingPath}
              onRenameSubmit={handleRenameSubmit}
              onRenameCancel={handleRenameCancel}
            />
          ))}
        {!loading && !error && rootItems.length === 0 && !newItemState && (
          <div className="p-4 text-xs text-center" style={{ color: '#666666' }}>
            No files found
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={handleCloseContextMenu}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onDelete={handleDelete}
        onRename={handleRename}
      />
    </div>
  )
}
