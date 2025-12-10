import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, unknown>
  onLinkClick?: (linkName: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      setWikiLink: (attributes: { href: string }) => ReturnType
      unsetWikiLink: () => ReturnType
    }
  }
}

export const WikiLink = Mark.create<WikiLinkOptions>({
  name: 'wikiLink',

  priority: 1000,

  keepOnSplit: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'wiki-link',
        'data-wiki-link': ''
      },
      onLinkClick: undefined
    }
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-href'),
        renderHTML: (attributes) => {
          return {
            'data-href': attributes.href
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wiki-link]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setWikiLink:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      unsetWikiLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        }
    }
  },

  addProseMirrorPlugins() {
    const onLinkClick = this.options.onLinkClick

    return [
      // Click handler plugin
      new Plugin({
        key: new PluginKey('wikiLinkClick'),
        props: {
          handleClick: (_view, _pos, event) => {
            const target = event.target as HTMLElement
            if (target.hasAttribute('data-wiki-link') && onLinkClick) {
              const linkName = target.getAttribute('data-href')
              if (linkName) {
                event.preventDefault()
                onLinkClick(linkName)
                return true
              }
            }
            return false
          }
        }
      }),
      // Decoration plugin to highlight [[link]] syntax
      new Plugin({
        key: new PluginKey('wikiLinkDecorations'),
        state: {
          init: (_, state) => {
            return createWikiLinkDecorations(state.doc, onLinkClick)
          },
          apply: (tr, oldDecorations) => {
            if (tr.docChanged) {
              return createWikiLinkDecorations(tr.doc, onLinkClick)
            }
            return oldDecorations.map(tr.mapping, tr.doc)
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)
          }
        }
      })
    ]
  }
})

// Helper function to create decorations for [[links]]
function createWikiLinkDecorations(
  doc: ProseMirrorNode,
  onLinkClick?: (linkName: string) => void
): DecorationSet {
  const decorations: Decoration[] = []
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (!node.isText || !node.text) return

    let match: RegExpExecArray | null
    while ((match = wikiLinkRegex.exec(node.text)) !== null) {
      const start = pos + match.index
      const end = start + match[0].length
      const linkName = match[1]

      decorations.push(
        Decoration.inline(start, end, {
          class: 'wiki-link',
          'data-wiki-link': '',
          'data-href': linkName,
          onclick: onLinkClick
            ? `window.__wikiLinkClick && window.__wikiLinkClick('${linkName.replace(/'/g, "\\'")}')`
            : undefined
        })
      )
    }
  })

  return DecorationSet.create(doc, decorations)
}

export default WikiLink
