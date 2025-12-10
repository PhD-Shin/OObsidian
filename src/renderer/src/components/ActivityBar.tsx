import { FC } from 'react'
import { Files, MessageSquare, Search, Settings } from 'lucide-react'

interface ActivityBarProps {
  showChat: boolean
  onToggleChat: () => void
  onOpenSettings: () => void
}

interface ActivityButtonProps {
  icon: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  title: string
}

const ActivityButton: FC<ActivityButtonProps> = ({ icon, isActive, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-10 h-10 flex items-center justify-center rounded transition-colors relative"
    style={{
      color: isActive ? '#e5e5e5' : '#666666',
      background: isActive ? '#1a1a1a' : 'transparent'
    }}
  >
    {isActive && (
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
        style={{ background: '#3b82f6' }}
      />
    )}
    {icon}
  </button>
)

export const ActivityBar: FC<ActivityBarProps> = ({ showChat, onToggleChat, onOpenSettings }) => {
  return (
    <div className="flex flex-col items-center py-2 gap-1">
      <ActivityButton icon={<Files size={20} />} isActive={true} title="Explorer" />
      <ActivityButton icon={<Search size={20} />} title="Search (Coming soon)" />
      <ActivityButton
        icon={<MessageSquare size={20} />}
        isActive={showChat}
        onClick={onToggleChat}
        title="AI Chat"
      />
      <div className="flex-1" />
      <ActivityButton icon={<Settings size={20} />} onClick={onOpenSettings} title="Settings" />
    </div>
  )
}
