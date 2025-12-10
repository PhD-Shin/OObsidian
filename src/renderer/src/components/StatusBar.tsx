import { FC } from 'react'

interface StatusBarProps {
  selectedFile: string | null
  isSaving?: boolean
  lineCount?: number
  wordCount?: number
}

export const StatusBar: FC<StatusBarProps> = ({
  selectedFile,
  isSaving = false,
  lineCount = 0,
  wordCount = 0
}) => {
  const fileName = selectedFile ? selectedFile.split('/').pop() : null

  return (
    <div
      className="h-6 flex items-center justify-between px-3 text-xs"
      style={{ background: '#141414', borderTop: '1px solid #1f1f1f', color: '#666666' }}
    >
      <div className="flex items-center gap-4">
        {fileName ? (
          <>
            <span>{fileName}</span>
            <span>Ln {lineCount}</span>
            <span>{wordCount} words</span>
          </>
        ) : (
          <span>No file selected</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isSaving && <span style={{ color: '#f59e0b' }}>Saving...</span>}
        <span>OObsidian</span>
      </div>
    </div>
  )
}
