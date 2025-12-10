import { useState, useEffect, useCallback } from 'react'
import { Link2, ChevronDown, ChevronRight, FileText } from 'lucide-react'

interface BacklinksProps {
  currentFilePath: string | null
  vaultPath: string | null
  onFileSelect: (path: string) => void
}

interface BacklinkEntry {
  path: string
  name: string
  context: string // Line containing the link
}

export const Backlinks: React.FC<BacklinksProps> = ({
  currentFilePath,
  vaultPath,
  onFileSelect
}) => {
  const [backlinks, setBacklinks] = useState<BacklinkEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Extract filename without extension from path
  const getNoteName = useCallback((filePath: string): string => {
    const fileName = filePath.split('/').pop() || filePath
    return fileName.replace(/\.md$/, '')
  }, [])

  // Search for backlinks when current file changes
  useEffect(() => {
    if (!currentFilePath || !vaultPath) {
      setBacklinks([])
      return
    }

    const currentNoteName = getNoteName(currentFilePath)
    const searchBacklinks = async (): Promise<void> => {
      setIsLoading(true)
      const foundBacklinks: BacklinkEntry[] = []

      // Recursive function to search files
      const searchDir = async (dirPath: string): Promise<void> => {
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
              await searchDir(entry.path)
            } else if (entry.name.endsWith('.md') && entry.path !== currentFilePath) {
              try {
                const content = await window.fs.readFile(entry.path)
                // Search for [[noteName]] pattern
                const regex = new RegExp(`\\[\\[${currentNoteName}\\]\\]`, 'gi')
                const lines = content.split('\n')

                for (const line of lines) {
                  if (regex.test(line)) {
                    foundBacklinks.push({
                      path: entry.path,
                      name: entry.name.replace(/\.md$/, ''),
                      context: line.trim().slice(0, 100) // First 100 chars of context
                    })
                    break // Only add each file once
                  }
                }
              } catch {
                // Skip files that can't be read
              }
            }
          }
        } catch {
          // Skip directories that can't be read
        }
      }

      await searchDir(vaultPath)
      setBacklinks(foundBacklinks)
      setIsLoading(false)
    }

    searchBacklinks()
  }, [currentFilePath, vaultPath, getNoteName])

  if (!currentFilePath) {
    return null
  }

  return (
    <div
      className="border-t"
      style={{ borderColor: '#1f1f1f', background: '#141414' }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#1a1a1a] transition-colors"
        style={{ color: '#666666' }}
      >
        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Link2 size={12} />
        <span className="uppercase tracking-wide font-medium">Backlinks</span>
        <span className="ml-auto" style={{ color: '#404040' }}>
          {isLoading ? '...' : backlinks.length}
        </span>
      </button>

      {/* Backlinks list */}
      {isExpanded && (
        <div className="pb-2">
          {backlinks.length === 0 ? (
            <div className="px-3 py-2 text-xs" style={{ color: '#404040' }}>
              {isLoading ? 'Searching...' : 'No backlinks found'}
            </div>
          ) : (
            <div className="space-y-1">
              {backlinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => onFileSelect(link.path)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={12} style={{ color: '#666666' }} />
                    <span className="text-xs truncate" style={{ color: '#a0a0a0' }}>
                      {link.name}
                    </span>
                  </div>
                  <div
                    className="text-xs mt-0.5 pl-5 truncate"
                    style={{ color: '#404040' }}
                  >
                    {link.context}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
