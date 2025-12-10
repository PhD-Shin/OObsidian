import { ElectronAPI } from '@electron-toolkit/preload'

interface FileInfo {
  name: string
  isDirectory: boolean
  path: string
}

interface FileOperationResult {
  success: boolean
  path?: string
}

interface DirChangeEvent {
  dirPath: string
  eventType: string
  filename: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    fs: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      listDir: (path: string) => Promise<FileInfo[]>
      selectDirectory: () => Promise<string | null>
      getDefaultPath: () => Promise<string>
      createFile: (path: string, content?: string) => Promise<FileOperationResult>
      deleteFile: (path: string) => Promise<FileOperationResult>
      renameFile: (oldPath: string, newPath: string) => Promise<FileOperationResult>
      createDir: (path: string) => Promise<FileOperationResult>
      watchFile: (path: string) => Promise<FileOperationResult>
      unwatchFile: (path: string) => Promise<FileOperationResult>
      watchDir: (path: string) => Promise<FileOperationResult>
      unwatchDir: (path: string) => Promise<FileOperationResult>
      onFileChanged: (callback: (filePath: string) => void) => void
      onDirChanged: (callback: (event: DirChangeEvent) => void) => void
      removeFileWatchListeners: () => void
    }
    ai: {
      chatStart: (messages: { role: string; content: string }[], model: string) => void
      onToken: (callback: (token: string) => void) => void
      onDone: (callback: () => void) => void
      onError: (callback: (err: string) => void) => void
      removeAllListeners: () => void
    }
  }
}
