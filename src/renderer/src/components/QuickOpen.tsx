import { FC, useState, useEffect, useCallback, useRef } from 'react'
import { Search, FileText, Folder } from 'lucide-react'

interface QuickOpenProps {
  isOpen: boolean
  onClose: () => void
  vaultPath: string
  onFileSelect: (path: string) => void
}

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  relativePath: string
}

// Recursively get all files in vault (defined outside component to avoid hook issues)
async function getAllFilesInDir(dirPath: string, relativePath: string = ''): Promise<FileItem[]> {
  const items: FileItem[] = []

  try {
    const entries = await window.fs.listDir(dirPath)

    for (const entry of entries) {
      // Skip hidden files and common ignored directories
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git'
      ) {
        continue
      }

      const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name

      if (entry.isDirectory) {
        // Recursively get files from subdirectories
        const subFiles = await getAllFilesInDir(entry.path, entryRelativePath)
        items.push(...subFiles)
      } else if (entry.name.endsWith('.md')) {
        items.push({
          name: entry.name,
          path: entry.path,
          isDirectory: false,
          relativePath: entryRelativePath
        })
      }
    }
  } catch {
    // Ignore errors for individual directories
  }

  return items
}

export const QuickOpen: FC<QuickOpenProps> = ({ isOpen, onClose, vaultPath, onFileSelect }) => {
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load all files when opened
  useEffect(() => {
    if (isOpen && vaultPath) {
      setIsLoading(true)
      getAllFilesInDir(vaultPath).then((allFiles) => {
        setFiles(allFiles)
        setFilteredFiles(allFiles.slice(0, 20)) // Show first 20 by default
        setIsLoading(false)
      })
      setQuery('')
      setSelectedIndex(0)
      // Focus input after a short delay
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, vaultPath])

  // Filter files based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredFiles(files.slice(0, 20))
      setSelectedIndex(0)
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = files.filter((file) => {
      const fileName = file.name.toLowerCase()
      const relativePath = file.relativePath.toLowerCase()
      return fileName.includes(lowerQuery) || relativePath.includes(lowerQuery)
    })

    // Sort by relevance (exact match first, then starts with, then includes)
    filtered.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()

      // Exact match (without extension)
      const aExact = aName.replace('.md', '') === lowerQuery
      const bExact = bName.replace('.md', '') === lowerQuery
      if (aExact && !bExact) return -1
      if (bExact && !aExact) return 1

      // Starts with
      const aStarts = aName.startsWith(lowerQuery)
      const bStarts = bName.startsWith(lowerQuery)
      if (aStarts && !bStarts) return -1
      if (bStarts && !aStarts) return 1

      // Alphabetical
      return aName.localeCompare(bName)
    })

    setFilteredFiles(filtered.slice(0, 20))
    setSelectedIndex(0)
  }, [query, files])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredFiles.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredFiles[selectedIndex]) {
            onFileSelect(filteredFiles[selectedIndex].path)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [filteredFiles, selectedIndex, onFileSelect, onClose]
  )

  const handleItemClick = useCallback(
    (file: FileItem) => {
      onFileSelect(file.path)
      onClose()
    },
    [onFileSelect, onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-xl rounded-lg shadow-2xl overflow-hidden"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
          <Search size={18} style={{ color: '#666666' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files..."
            className="flex-1 ml-3 bg-transparent text-sm focus:outline-none"
            style={{ color: '#e5e5e5' }}
          />
          {isLoading && (
            <span className="text-xs" style={{ color: '#666666' }}>
              Loading...
            </span>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: '#666666' }}>
              {query ? 'No files found' : 'No markdown files in vault'}
            </div>
          ) : (
            filteredFiles.map((file, index) => (
              <div
                key={file.path}
                onClick={() => handleItemClick(file)}
                className="flex items-center px-4 py-2 cursor-pointer transition-colors"
                style={{
                  background: index === selectedIndex ? '#2a2a2a' : 'transparent'
                }}
              >
                {file.isDirectory ? (
                  <Folder size={16} style={{ color: '#f59e0b' }} />
                ) : (
                  <FileText size={16} style={{ color: '#666666' }} />
                )}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: '#e5e5e5' }}>
                    {file.name.replace('.md', '')}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#4a4a4a' }}>
                    {file.relativePath}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between text-xs"
          style={{ borderTop: '1px solid #2a2a2a', color: '#4a4a4a' }}
        >
          <span>
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a2a' }}>
              ↑↓
            </kbd>{' '}
            to navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a2a' }}>
              Enter
            </kbd>{' '}
            to open
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a2a' }}>
              Esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  )
}
