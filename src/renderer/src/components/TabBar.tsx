import { FC, useCallback } from 'react'
import { X, FileText } from 'lucide-react'

export interface Tab {
  path: string
  name: string
  isDirty: boolean
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string | null
  onTabSelect: (path: string) => void
  onTabClose: (path: string) => void
}

export const TabBar: FC<TabBarProps> = ({ tabs, activeTab, onTabSelect, onTabClose }) => {
  const handleClose = useCallback(
    (e: React.MouseEvent, path: string) => {
      e.stopPropagation()
      onTabClose(path)
    },
    [onTabClose]
  )

  if (tabs.length === 0) {
    return null
  }

  return (
    <div
      className="flex items-center overflow-x-auto"
      style={{
        background: '#0d0d0d',
        borderBottom: '1px solid #1f1f1f',
        height: '36px',
        minHeight: '36px'
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.path}
          onClick={() => onTabSelect(tab.path)}
          className="flex items-center gap-2 px-3 h-full cursor-pointer group transition-colors"
          style={{
            background: activeTab === tab.path ? '#141414' : 'transparent',
            borderRight: '1px solid #1f1f1f',
            minWidth: '120px',
            maxWidth: '200px'
          }}
        >
          <FileText size={14} style={{ color: '#666666', flexShrink: 0 }} />
          <span
            className="text-xs truncate flex-1"
            style={{ color: activeTab === tab.path ? '#e5e5e5' : '#808080' }}
          >
            {tab.name}
          </span>
          {tab.isDirty && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#3b82f6' }}
            />
          )}
          <button
            onClick={(e) => handleClose(e, tab.path)}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
            style={{ color: '#666666' }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
