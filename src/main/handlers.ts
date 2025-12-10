import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

import { streamChatOpenAI, OPENAI_MODELS } from './openai'

// Store active file watchers
const fileWatchers = new Map<string, fsSync.FSWatcher>()

// Path validation to prevent directory traversal attacks
const isValidPath = (filePath: string): boolean => {
  // Normalize the path to resolve any .. or . segments
  const normalizedPath = path.normalize(filePath)

  // Check for null bytes (common attack vector)
  if (filePath.includes('\0')) {
    return false
  }

  // Ensure it's an absolute path
  if (!path.isAbsolute(normalizedPath)) {
    return false
  }

  return true
}

// Blocked paths that should never be accessed
const BLOCKED_PATHS = ['/etc/passwd', '/etc/shadow', '/etc/hosts', '/.ssh', '/private/etc']

const isBlockedPath = (filePath: string): boolean => {
  const normalizedPath = path.normalize(filePath)
  return BLOCKED_PATHS.some(
    (blocked) => normalizedPath.startsWith(blocked) || normalizedPath === blocked
  )
}

export const registerHandlers = (): void => {
  ipcMain.on('ai:chat-start', (event, { messages, model }) => {
    streamChatOpenAI(
      messages,
      model || 'gpt-5-mini',
      (token: string) => event.sender.send('ai:token', token),
      () => event.sender.send('ai:done'),
      (err: Error) => event.sender.send('ai:error', err.message)
    )
  })

  // Get available AI models
  ipcMain.handle('ai:get-models', () => {
    return OPENAI_MODELS
  })

  ipcMain.handle('fs:read-file', async (_, filePath: string) => {
    if (!isValidPath(filePath)) {
      throw new Error('Invalid file path')
    }

    if (isBlockedPath(filePath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read file'
      throw new Error(message)
    }
  })

  ipcMain.handle('fs:write-file', async (_, filePath: string, content: string) => {
    if (!isValidPath(filePath)) {
      throw new Error('Invalid file path')
    }

    if (isBlockedPath(filePath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      return await fs.writeFile(filePath, content, 'utf-8')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to write file'
      throw new Error(message)
    }
  })

  ipcMain.handle('fs:list-dir', async (_, dirPath: string) => {
    if (!isValidPath(dirPath)) {
      throw new Error('Invalid directory path')
    }

    if (isBlockedPath(dirPath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      const dirents = await fs.readdir(dirPath, { withFileTypes: true })
      return dirents.map((dirent) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        path: path.join(dirPath, dirent.name)
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list directory'
      throw new Error(message)
    }
  })

  // Select directory dialog
  ipcMain.handle('fs:select-directory', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(window!, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Vault Folder'
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  // Create new file
  ipcMain.handle('fs:create-file', async (_, filePath: string, content: string = '') => {
    if (!isValidPath(filePath)) {
      throw new Error('Invalid file path')
    }

    if (isBlockedPath(filePath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      // Check if file already exists
      try {
        await fs.access(filePath)
        throw new Error('File already exists')
      } catch {
        // File doesn't exist, good to create
      }

      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true, path: filePath }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create file'
      throw new Error(message)
    }
  })

  // Delete file
  ipcMain.handle('fs:delete-file', async (_, filePath: string) => {
    if (!isValidPath(filePath)) {
      throw new Error('Invalid file path')
    }

    if (isBlockedPath(filePath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      await fs.unlink(filePath)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete file'
      throw new Error(message)
    }
  })

  // Rename file
  ipcMain.handle('fs:rename-file', async (_, oldPath: string, newPath: string) => {
    if (!isValidPath(oldPath) || !isValidPath(newPath)) {
      throw new Error('Invalid file path')
    }

    if (isBlockedPath(oldPath) || isBlockedPath(newPath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      await fs.rename(oldPath, newPath)
      return { success: true, path: newPath }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to rename file'
      throw new Error(message)
    }
  })

  // Create directory
  ipcMain.handle('fs:create-dir', async (_, dirPath: string) => {
    if (!isValidPath(dirPath)) {
      throw new Error('Invalid directory path')
    }

    if (isBlockedPath(dirPath)) {
      throw new Error('Access to this path is not allowed')
    }

    try {
      await fs.mkdir(dirPath, { recursive: true })
      return { success: true, path: dirPath }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create directory'
      throw new Error(message)
    }
  })

  // Get default vault path (app's current working directory or user's home)
  ipcMain.handle('fs:get-default-path', async () => {
    // Use app path in production, or current working directory in development
    const defaultPath = app.isPackaged
      ? path.join(app.getPath('documents'), 'OObsidian')
      : process.cwd()

    // Ensure the directory exists
    try {
      await fs.access(defaultPath)
    } catch {
      // If it doesn't exist, create it (for packaged app)
      if (app.isPackaged) {
        await fs.mkdir(defaultPath, { recursive: true })
      }
    }

    return defaultPath
  })

  // Watch a file for changes
  ipcMain.handle('fs:watch-file', (event, filePath: string) => {
    if (!isValidPath(filePath)) {
      throw new Error('Invalid file path')
    }

    // Stop existing watcher for this file
    if (fileWatchers.has(filePath)) {
      fileWatchers.get(filePath)?.close()
      fileWatchers.delete(filePath)
    }

    try {
      const watcher = fsSync.watch(filePath, (eventType) => {
        if (eventType === 'change') {
          event.sender.send('fs:file-changed', filePath)
        }
      })

      fileWatchers.set(filePath, watcher)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to watch file'
      throw new Error(message)
    }
  })

  // Stop watching a file
  ipcMain.handle('fs:unwatch-file', (_, filePath: string) => {
    if (fileWatchers.has(filePath)) {
      fileWatchers.get(filePath)?.close()
      fileWatchers.delete(filePath)
    }
    return { success: true }
  })

  // Watch a directory for changes (new files, deletions, renames)
  ipcMain.handle('fs:watch-dir', (event, dirPath: string) => {
    if (!isValidPath(dirPath)) {
      throw new Error('Invalid directory path')
    }

    const watcherId = `dir:${dirPath}`

    // Stop existing watcher for this directory
    if (fileWatchers.has(watcherId)) {
      fileWatchers.get(watcherId)?.close()
      fileWatchers.delete(watcherId)
    }

    try {
      const watcher = fsSync.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          event.sender.send('fs:dir-changed', {
            dirPath,
            eventType,
            filename: filename.toString()
          })
        }
      })

      fileWatchers.set(watcherId, watcher)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to watch directory'
      throw new Error(message)
    }
  })

  // Stop watching a directory
  ipcMain.handle('fs:unwatch-dir', (_, dirPath: string) => {
    const watcherId = `dir:${dirPath}`
    if (fileWatchers.has(watcherId)) {
      fileWatchers.get(watcherId)?.close()
      fileWatchers.delete(watcherId)
    }
    return { success: true }
  })
}
