import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import fs from 'fs/promises'
import path from 'path'

import { streamChat } from './ollama'

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
    streamChat(
      messages,
      model,
      (token) => event.sender.send('ai:token', token),
      () => event.sender.send('ai:done'),
      (err) => event.sender.send('ai:error', err.message)
    )
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
}
