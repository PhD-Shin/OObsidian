import { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Typography from '@tiptap/extension-typography'
import { common, createLowlight } from 'lowlight'
import { TextSelection } from '@tiptap/pm/state'
import { WikiLink } from '../extensions/WikiLink'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

interface EditorProps {
  content: string
  filePath: string
  onChange: (content: string) => void
  onLinkClick?: (linkName: string) => void
}

// Debounce hook for file saving
function useDebounce<T extends (...args: Parameters<T>) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Get filename from path
const getFileName = (path: string): string => {
  return path.split('/').pop() || path
}

// Convert markdown to HTML for TipTap
const markdownToHtml = (markdown: string): string => {
  // Basic markdown to HTML conversion
  const html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Paragraphs (lines not already wrapped)
    .split('\n')
    .map((line) => {
      if (
        line.startsWith('<h') ||
        line.startsWith('<li') ||
        line.startsWith('<blockquote') ||
        line.startsWith('<pre') ||
        line.trim() === ''
      ) {
        return line
      }
      return `<p>${line}</p>`
    })
    .join('\n')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  return html
}

// Convert HTML back to markdown
const htmlToMarkdown = (html: string): string => {
  const markdown = html
    // Headers
    .replace(/<h1>(.*?)<\/h1>/g, '# $1')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1')
    .replace(/<h4>(.*?)<\/h4>/g, '#### $1')
    .replace(/<h5>(.*?)<\/h5>/g, '##### $1')
    .replace(/<h6>(.*?)<\/h6>/g, '###### $1')
    // Bold
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    // Italic
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    // Inline code
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    // Links
    .replace(/<a href="([^"]*)">(.*?)<\/a>/g, '[$2]($1)')
    // Blockquotes
    .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1')
    // Lists
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>(.*?)<\/li>/g, '- $1')
    // Paragraphs
    .replace(/<p>(.*?)<\/p>/g, '$1')
    // Code blocks
    .replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, '```$1\n$2\n```')
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```')
    // Line breaks
    .replace(/<br\s*\/?>/g, '\n')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return markdown
}

export const MarkdownEditor: FC<EditorProps> = ({ content, filePath, onChange, onLinkClick }) => {
  const [isRawMode, setIsRawMode] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Debounced save function (500ms delay)
  const debouncedOnChange = useDebounce(onChange, 500)

  // Memoize WikiLink extension to prevent recreation
  const wikiLinkExtension = useMemo(() => {
    return WikiLink.configure({
      onLinkClick: onLinkClick
    })
  }, [onLinkClick])

  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default, use lowlight version
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            const level = node.attrs.level
            return '#'.repeat(level) + ' '
          }
          return 'Start writing... (Type # for headings, - for lists, > for quotes)'
        },
        includeChildren: true
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight
      }),
      wikiLinkExtension
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-full'
      },
      handleKeyDown: (view, event) => {
        // When backspace is pressed on an empty heading, convert to paragraph with # prefix
        if (event.key === 'Backspace') {
          const { state } = view
          const { selection } = state
          const { $from } = selection

          // Check if we're at the start of a heading node and it's empty
          if ($from.parent.type.name === 'heading' && $from.parent.textContent === '' && $from.parentOffset === 0) {
            const level = $from.parent.attrs.level as number
            const hashes = '#'.repeat(level) + ' '

            // Create a transaction to replace heading with paragraph containing #
            const tr = state.tr
            const pos = $from.before()
            const paragraphType = state.schema.nodes.paragraph

            tr.replaceWith(pos, $from.after(), paragraphType.create(null, state.schema.text(hashes)))
            // Set cursor at the end of the inserted text
            const newPos = pos + hashes.length + 1
            tr.setSelection(TextSelection.create(tr.doc, newPos))

            view.dispatch(tr)
            return true
          }
        }
        return false
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      const markdown = htmlToMarkdown(html)
      setLocalContent(markdown)
      debouncedOnChange(markdown)
    }
  })

  // Sync local content when external content changes (file switch)
  // Parent component uses key={activeFile} to remount on file change
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  // Handle raw mode content changes
  const handleRawChange = useCallback(
    (newContent: string) => {
      setLocalContent(newContent)
      debouncedOnChange(newContent)
    },
    [debouncedOnChange]
  )

  // Sync raw mode to editor when switching
  const toggleMode = useCallback(() => {
    if (isRawMode && editor) {
      // Switching from raw to rich - update editor
      editor.commands.setContent(markdownToHtml(localContent))
    }
    setIsRawMode(!isRawMode)
  }, [isRawMode, editor, localContent])

  // Handle tab key in raw mode
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = e.currentTarget
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value

        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        handleRawChange(newValue)

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        })
      }
    },
    [handleRawChange]
  )

  const fileName = getFileName(filePath)

  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* File tab */}
      <div
        className="flex items-center justify-between h-10 px-4 border-b text-sm"
        style={{ background: '#141414', borderColor: '#1f1f1f' }}
      >
        <span style={{ color: '#e5e5e5' }}>{fileName}</span>
        <button
          onClick={toggleMode}
          className="px-2 py-1 text-xs rounded transition-colors"
          style={{
            background: isRawMode ? '#3b82f6' : '#1a1a1a',
            color: isRawMode ? '#fff' : '#666'
          }}
        >
          {isRawMode ? 'Rich' : 'Raw'}
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto" style={{ padding: '24px 32px' }}>
        {isRawMode ? (
          <textarea
            ref={textareaRef}
            className="raw-editor w-full h-full resize-none focus:outline-none"
            style={{
              background: 'transparent',
              color: '#e5e5e5',
              border: 'none',
              caretColor: '#3b82f6',
              minHeight: '100%'
            }}
            value={localContent}
            onChange={(e) => handleRawChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="Start writing..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  )
}
