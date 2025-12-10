import { useState, useEffect, useCallback } from 'react'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Loader2,
  FileText
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

// Get file icon based on extension
const getFileIcon = (name: string): JSX.Element => {
  if (name.endsWith('.md')) {
    return <FileText size={14} style={{ color: '#22c55e' }} />
  }
  return <File size={14} style={{ color: '#666666' }} />
}

const FileTreeItem: React.FC<{
  item: FileItem
  onFileSelect: (path: string) => void
  level: number
  selectedPath?: string
}> = ({ item, onFileSelect, level, selectedPath }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [children, setChildren] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelected = selectedPath === item.path

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
            const filtered = items.filter((i) => !shouldHideItem(i.name))
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
      >
        <span className="mr-1 w-4 flex items-center justify-center" style={{ color: '#666666' }}>
          {item.isDirectory && (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
        </span>
        <span className="mr-2 flex-shrink-0">{renderIcon()}</span>
        <span className="truncate">{item.name}</span>
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

  const loadRoot = useCallback(async () => {
    if (!currentPath) return

    setLoading(true)
    setError(null)

    try {
      const items = await window.fs.listDir(currentPath)
      const filtered = items.filter((i) => !shouldHideItem(i.name))
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

  const handleFileSelect = useCallback(
    (path: string) => {
      onFileSelect(path)
    },
    [onFileSelect]
  )

  // Get the folder name from path
  const folderName = currentPath.split('/').filter(Boolean).pop() || 'Vault'

  return (
    <div className="flex flex-col h-full select-none" style={{ background: '#141414' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 h-10 text-xs font-medium uppercase tracking-wide"
        style={{ color: '#666666', borderBottom: '1px solid #1f1f1f' }}
      >
        <Folder size={12} style={{ color: '#f59e0b' }} />
        <span className="truncate">{folderName}</span>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-auto py-1">
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
            />
          ))}
        {!loading && !error && rootItems.length === 0 && (
          <div className="p-4 text-xs text-center" style={{ color: '#666666' }}>
            No files found
          </div>
        )}
      </div>
    </div>
  )
}
