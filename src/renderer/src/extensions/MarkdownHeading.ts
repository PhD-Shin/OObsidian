import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// Custom extension for Obsidian-style markdown heading input
// When user types ### followed by text and presses Enter, it converts to h3
// Also shows preview styling while typing
export const MarkdownHeading = Extension.create({
  name: 'markdownHeading',

  addProseMirrorPlugins() {
    return [
      // Decoration plugin - adds preview styling to paragraphs starting with #
      new Plugin({
        key: new PluginKey('markdownHeadingDecoration'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc } = state

            doc.descendants((node, pos) => {
              if (node.type.name === 'paragraph') {
                const text = node.textContent
                const match = text.match(/^(#{1,6})\s/)

                if (match) {
                  const level = match[1].length
                  // Add class to the paragraph node
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: `markdown-heading-preview-${level}`
                    })
                  )
                }
              }
            })

            return DecorationSet.create(doc, decorations)
          }
        }
      }),

      // Key handler plugin - converts to heading on Enter
      new Plugin({
        key: new PluginKey('markdownHeadingKeyHandler'),
        props: {
          handleKeyDown: (view, event) => {
            // Only handle Enter key
            if (event.key !== 'Enter') return false

            const { state } = view
            const { selection } = state
            const { $from } = selection

            // Only process paragraph nodes
            if ($from.parent.type.name !== 'paragraph') return false

            const text = $from.parent.textContent
            // Match heading patterns: # to ######
            const headingMatch = text.match(/^(#{1,6})\s+(.*)$/)

            if (headingMatch) {
              const level = headingMatch[1].length
              const content = headingMatch[2]

              // Don't convert if content is empty - let user type content first
              if (content.trim() === '') return false

              const { tr } = state
              const pos = $from.before()
              const headingType = state.schema.nodes.heading

              // Replace paragraph with heading
              const headingNode = headingType.create(
                { level },
                content ? state.schema.text(content) : null
              )

              tr.replaceWith(pos, $from.after(), headingNode)

              // Create a new paragraph after the heading for continued typing
              const paragraphType = state.schema.nodes.paragraph
              const newParagraph = paragraphType.create()
              tr.insert(tr.mapping.map($from.after()), newParagraph)

              // Set cursor to the new paragraph
              const newPos = tr.mapping.map($from.after()) + 1
              tr.setSelection(TextSelection.create(tr.doc, newPos))

              view.dispatch(tr)
              return true
            }

            return false
          }
        }
      })
    ]
  }
})
