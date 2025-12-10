import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface FileInfo {
  name: string
  isDirectory: boolean
  path: string
}

interface FileOperationResult {
  success: boolean
  path?: string
}

// File System API
const fsApi = {
  readFile: (path: string): Promise<string> => ipcRenderer.invoke('fs:read-file', path),
  writeFile: (path: string, content: string): Promise<void> =>
    ipcRenderer.invoke('fs:write-file', path, content),
  listDir: (path: string): Promise<FileInfo[]> => ipcRenderer.invoke('fs:list-dir', path),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('fs:select-directory'),
  getDefaultPath: (): Promise<string> => ipcRenderer.invoke('fs:get-default-path'),
  createFile: (path: string, content?: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('fs:create-file', path, content || ''),
  deleteFile: (path: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('fs:delete-file', path),
  renameFile: (oldPath: string, newPath: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('fs:rename-file', oldPath, newPath),
  createDir: (path: string): Promise<FileOperationResult> =>
    ipcRenderer.invoke('fs:create-dir', path)
}

// AI Chat API
const aiApi = {
  chatStart: (messages: ChatMessage[], model: string): void =>
    ipcRenderer.send('ai:chat-start', { messages, model }),
  onToken: (callback: (token: string) => void): void => {
    ipcRenderer.on('ai:token', (_, token) => callback(token))
  },
  onDone: (callback: () => void): void => {
    ipcRenderer.on('ai:done', () => callback())
  },
  onError: (callback: (err: string) => void): void => {
    ipcRenderer.on('ai:error', (_, err) => callback(err))
  },
  removeAllListeners: (): void => {
    ipcRenderer.removeAllListeners('ai:token')
    ipcRenderer.removeAllListeners('ai:done')
    ipcRenderer.removeAllListeners('ai:error')
  }
}

// Expose APIs to renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('fs', fsApi)
    contextBridge.exposeInMainWorld('ai', aiApi)
  } catch {
    // Context bridge failed - this shouldn't happen in normal circumstances
  }
} else {
  // Non-isolated context (development only)
  // @ts-expect-error - Extending window object
  window.electron = electronAPI
  // @ts-expect-error - Extending window object
  window.fs = fsApi
  // @ts-expect-error - Extending window object
  window.ai = aiApi
}
