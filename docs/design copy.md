# ㅁㅇㄹOObsidian Design System
## 1. Design Philosophy
### OObsidian follows a **dark-first, minimal distraction** design philosophy inspired by:
- **Obsidian**: Clean vault-based file explorer, seamless markdown editing
- **Cursor**: Dark monochromatic UI, subtle borders, professional feel
- **Antigravity**: Deep blacks, minimal contrast between sections
- **Notion**: Clean typography, block-based editing

### Core Principles
1. **Darkness**: Pure dark backgrounds (#0d0d0d ~ #1a1a1a) - no white panels

2. **Subtlety**: Minimal visual noise, borders only where necessary

3. **Focus**: Content is king - UI should disappear when writing

4. **Consistency**: Same visual language throughout the app

5. **Performance**: Smooth animations, instant feedback

---

## 2. Color Palette
### Base Colors (Dark Theme Only)
`

Background Layer 0 (Deepest):

--background: #0d0d0d // Main editor area

Background Layer 1:

--background-secondary: #141414 // Sidebar, panels

Background Layer 2:

--background-tertiary: #1a1a1a // Elevated surfaces, cards, inputs

Background Layer 3:

--background-hover: #252525 // Hover states

--background-active: #2a2a2a // Active/selected states

--background-selected: #1e3a5f // Selection with accent tint

### `Border Colors`

--border: #1f1f1f // Subtle borders (default)

--border-hover: #333333 // Borders on hover

--border-active: #404040 // Active element borders

--border-focus: #3b82f6 // Focus ring (accent)

### `Text Colors`

--text-primary: #e5e5e5 // Main text (90% white)

--text-secondary: #a0a0a0 // Secondary text, labels

--text-muted: #666666 // Muted text, placeholders

--text-faint: #404040 // Very subtle text, disabled

--text-inverse: #0d0d0d // Text on light backgrounds

### `Accent Colors`

Primary (Blue):

--accent: #3b82f6 // Primary accent

--accent-hover: #2563eb // Accent hover (darker)

--accent-muted: #1e40af // Muted accent

--accent-bg: #1e3a5f // Accent background tint

Success (Green):

--success: #22c55e // Success states

--success-bg: #14532d // Success background

Warning (Amber):

--warning: #f59e0b // Warning states

--warning-bg: #78350f // Warning background

Error (Red):

--error: #ef4444 // Error states

--error-bg: #7f1d1d // Error background

Info (Cyan):

--info: #06b6d4 // Info states

--info-bg: #164e63 // Info background

### `Special Colors`

File Icons:

--folder: #f59e0b // Folder icons (amber)

--file-default: #a0a0a0 // Default file icon

--file-markdown: #22c55e // .md files (green)

--file-code: #3b82f6 // Code files (blue)

--file-image: #8b5cf6 // Image files (purple)

--file-config: #f59e0b // Config files (amber)

Syntax Highlighting:

--syntax-keyword: #c678dd // Keywords (purple)

--syntax-string: #98c379 // Strings (green)

--syntax-number: #d19a66 // Numbers (orange)

--syntax-comment: #5c6370 // Comments (gray)

--syntax-function: #61afef // Functions (blue)

--syntax-variable: #e06c75 // Variables (red)

`---`

## `3. Typography`
### `Font Stack`
``css`

`/ Sans-serif (UI, body text) /`

`--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`

`/ Monospace (code, editor) /`

`--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;`

`/ Serif (optional, for reading mode) /`

`--font-serif: 'Merriweather', 'Georgia', 'Times New Roman', serif;`

### Font Sizes

`--text-2xs: 10px // Micro labels`

`--text-xs: 11px // Tiny labels, status bar`

`--text-sm: 12px // Secondary text, sidebar items`

`--text-base: 14px // Base text, buttons`

`--text-md: 15px // Editor body text`

`--text-lg: 16px // Section headers`

`--text-xl: 18px // Panel titles`

`--text-2xl: 20px // Page titles`

`--text-3xl: 24px // Large headings`

`--text-4xl: 30px // Hero headings`

### Font Weights

`--font-light: 300`

`--font-normal: 400`

`--font-medium: 500`

`--font-semibold: 600`

`--font-bold: 700`

### Line Heights

`--leading-tight: 1.25`

`--leading-snug: 1.375`

`--leading-normal: 1.5`

`--leading-relaxed: 1.625`

`--leading-loose: 1.75`

`--leading-editor: 1.7 // Optimal for markdown editing`

### Letter Spacing

`--tracking-tighter: -0.05em`

`--tracking-tight: -0.025em`

`--tracking-normal: 0`

`--tracking-wide: 0.025em`

`--tracking-wider: 0.05em`

`--tracking-widest: 0.1em`

---

## 4. Spacing System
### Base Unit: 4px

`--space-0: 0`

`--space-px: 1px`

`--space-0.5: 2px`

`--space-1: 4px`

`--space-1.5: 6px`

`--space-2: 8px`

`--space-2.5: 10px`

`--space-3: 12px`

`--space-3.5: 14px`

`--space-4: 16px`

`--space-5: 20px`

`--space-6: 24px`

`--space-7: 28px`

`--space-8: 32px`

`--space-9: 36px`

`--space-10: 40px`

`--space-12: 48px`

`--space-14: 56px`

`--space-16: 64px`

### Component Spacing
| Component | Padding | Gap |

| -------------- | ------------------------ | ---- |

| Activity Bar | 12px vertical | 8px |

| Sidebar Header | 12px horizontal | - |

| Sidebar Item | 8px 12px | 4px |

| Editor | 24px 32px (min 48px top) | - |

| Chat Message | 12px | 8px |

| Chat Input | 12px | 8px |

| Status Bar | 0 12px | 16px |

| Modal | 24px | 16px |

| Dropdown | 8px | 2px |

| Button | 8px 16px | 8px |

---

## 5. Component Specifications
### 5.1 Activity Bar (Far Left)

`Dimensions:`

`Width: 48px`

`Icon size: 20px`

`Icon spacing: 8px vertical`

`Colors:`

`Background: #0d0d0d`

`Border-right: 1px solid #1f1f1f`

`Icon default: #666666`

`Icon hover: #a0a0a0`

`Icon active: #e5e5e5`

`Active Indicator:`

`Width: 2px`

`Position: left edge`

`Color: #3b82f6 (accent)`

`Height: 24px`

`Border-radius: 0 2px 2px 0`

`Hover State:`

`Background: #1a1a1a`

`Transition: 100ms ease`

### 5.2 File Explorer (Sidebar)

`Dimensions:`

`Width: 240px (resizable)`

`Min width: 180px`

`Max width: 400px`

`Resize handle: 4px wide (invisible, cursor: col-resize)`

`Header:`

`Height: 40px`

`Padding: 0 12px`

`Font: 11px, semibold, uppercase`

`Letter-spacing: 0.05em`

`Color: #666666`

`Background: transparent`

`Border-bottom: 1px solid #1f1f1f`

`Tree Item:`

`Height: 28px`

`Padding-left: 8px + (depth * 16px)`

`Padding-right: 8px`

`Font: 13px, normal`

`Color: #a0a0a0`

`Tree Item States:`

`Hover: Background: #1a1a1a, Color: #e5e5e5`

`Selected: Background: #252525, Color: #e5e5e5`

`Active (editing): Background: #1e3a5f, Color: #e5e5e5`

`Icons:`

`Size: 14px`

`Margin-right: 8px`

`Chevron: 12px, #666666`

`Folder: #f59e0b`

`File (.md): #22c55e`

`File (default): #666666`

`Empty State:`

`Padding: 24px`

`Text: "No files found"`

`Color: #666666`

`Font: 12px italic`

### 5.3 Editor Area

`Container:`

`Background: #0d0d0d`

`Min-width: 400px`

`Tab Bar:`

`Height: 40px`

`Background: #141414`

`Border-bottom: 1px solid #1f1f1f`

`Tab:`

`Padding: 0 16px`

`Font: 13px`

`Color (inactive): #666666`

`Color (active): #e5e5e5`

`Background (active): #0d0d0d`

`Border-bottom (active): 2px solid #3b82f6`

`Close button: 14px, appears on hover`

`Editor Content:`

`Max-width: 800px (centered, optional)`

`Padding: 48px 32px`

`Font: 15px`

`Line-height: 1.7`

`Color: #e5e5e5`

`Caret: #3b82f6`

`Selection: rgba(59, 130, 246, 0.3)`

`Placeholder:`

`Color: #404040`

`Font-style: italic`

### 5.4 Status Bar

`Dimensions:`

`Height: 24px`

`Padding: 0 12px`

`Colors:`

`Background: #141414`

`Border-top: 1px solid #1f1f1f`

`Text: #666666`

`Items:`

`Font: 11px`

`Gap: 16px`

`Icon size: 12px`

`Sections:`

`Left: File info, line count`

`Right: Save status, model name, connection status`

### 5.5 Chat Panel (Right)

`Dimensions:`

`Width: 320px (resizable)`

`Min width: 280px`

`Max width: 480px`

`Header:`

`Height: 44px`

`Padding: 0 12px`

`Background: #141414`

`Border-bottom: 1px solid #1f1f1f`

`Title: 12px, semibold, uppercase, #666666`

`Messages Area:`

`Padding: 12px`

`Gap: 16px`

`Background: #141414`

`Overflow: auto`

`Message Bubble:`

`Max-width: 90%`

`Padding: 12px`

`Border-radius: 8px`

`Font: 14px`

`Line-height: 1.5`

`User: Background: #3b82f6, Color: #ffffff, Align: right`

`Assistant: Background: #1a1a1a, Color: #e5e5e5, Align: left`

`System/Error: Background: #7f1d1d, Color: #fca5a5, Align: center, Font: 12px`

`Input Area:`

`Padding: 12px`

`Border-top: 1px solid #1f1f1f`

`Textarea:`

`Background: #1a1a1a`

`Border: 1px solid #1f1f1f`

`Border-radius: 8px`

`Padding: 12px`

`Font: 14px`

`Color: #e5e5e5`

`Rows: 2-4 (auto-expand)`

`Focus: Border-color: #3b82f6, Box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1)`

`Send Button:`

`Width: 40px`

`Height: 40px`

`Background: #3b82f6`

`Color: #ffffff`

`Border-radius: 8px`

`Disabled: Opacity: 0.3, Cursor: not-allowed`

### 5.6 Settings Modal

`Overlay:`

`Background: rgba(0, 0, 0, 0.6)`

`Backdrop-filter: blur(4px)`

`Modal:`

`Width: 600px`

`Max-height: 80vh`

`Background: #141414`

`Border: 1px solid #1f1f1f`

`Border-radius: 12px`

`Box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5)`

`Header:`

`Padding: 20px 24px`

`Border-bottom: 1px solid #1f1f1f`

`Title: 18px, semibold`

`Close button: 20px, #666666`

`Body:`

`Padding: 24px`

`Overflow: auto`

`Section:`

`Margin-bottom: 24px`

`Section Title:`

`Font: 12px, semibold, uppercase`

`Color: #666666`

`Letter-spacing: 0.05em`

`Margin-bottom: 12px`

`Input Field:`

`Height: 40px`

`Padding: 0 12px`

`Background: #1a1a1a`

`Border: 1px solid #1f1f1f`

`Border-radius: 6px`

`Font: 14px`

`Color: #e5e5e5`

`Footer:`

`Padding: 16px 24px`

`Border-top: 1px solid #1f1f1f`

`Text-align: right`

`Button (Primary):`

`Padding: 10px 20px`

`Background: #3b82f6`

`Color: #ffffff`

`Border-radius: 6px`

`Font: 14px, medium`

`Button (Secondary):`

`Background: transparent`

`Border: 1px solid #1f1f1f`

`Color: #a0a0a0`

---

## 6. Layout Structure
### Main Layout

`┌────────────────────────────────────────────────────────────┐`

`│ Window Frame │`

`├────┬───────────┬──────────────────────────┬────────────────┤`

`│ │ │ │ │`

`│ A │ S │ E │ C │`

`│ C │ I │ D │ H │`

`│ T │ D │ I │ A │`

`│ I │ E │ T │ T │`

`│ V │ B │ O │ │`

`│ I │ A │ R │ P │`

`│ T │ R │ │ A │`

`│ Y │ │ │ N │`

`│ │ │ │ E │`

`│ B │ │ │ L │`

`│ A │ │ │ │`

`│ R │ │ │ │`

`│ │ │ │ │`

`├────┴───────────┴──────────────────────────┴────────────────┤`

`│ Status Bar │`

`└────────────────────────────────────────────────────────────┘`

`Dimensions:`

- `Activity Bar: 48px fixed`
- `Sidebar: 240px default (resizable 180-400px)`
- `Editor: flex-1 (min 400px)`
- `Chat Panel: 320px default (resizable 280-480px, collapsible)`
- `Status Bar: 24px fixed`

### Responsive Breakpoints

`Minimum window: 800 x 500px`

`&lt; 1000px:`

- `Hide chat panel (show as overlay)`
- `Reduce sidebar to icon + label`

`&lt; 900px:`

- `Collapse sidebar (icon only, expand on hover)`

`&lt; 800px:`

- `Not supported (minimum width)`

---

## 7. Interaction States
### Buttons

`Default:`

`Background: transparent OR #1a1a1a`

`Color: #a0a0a0`

`Border: 1px solid #1f1f1f OR none`

`Hover:`

`Background: #252525`

`Color: #e5e5e5`

`Transition: 100ms ease`

`Active/Pressed:`

`Background: #2a2a2a`

`Transform: scale(0.98)`

`Disabled:`

`Opacity: 0.4`

`Cursor: not-allowed`

`Pointer-events: none`

`Focus-visible:`

`Outline: 2px solid #3b82f6`

`Outline-offset: 2px`

### Text Inputs

`Default:`

`Background: #1a1a1a`

`Border: 1px solid #1f1f1f`

`Color: #e5e5e5`

`Placeholder:`

`Color: #404040`

`Hover:`

`Border-color: #333333`

`Focus:`

`Border-color: #3b82f6`

`Box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1)`

`Error:`

`Border-color: #ef4444`

`Box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1)`

`Disabled:`

`Background: #141414`

`Color: #404040`

`Cursor: not-allowed`

### Links

`Default:`

`Color: #3b82f6`

`Text-decoration: none`

`Hover:`

`Text-decoration: underline`

`Active:`

`Color: #2563eb`

### File Tree Items

`Default:`

`Background: transparent`

`Color: #a0a0a0`

`Hover:`

`Background: #1a1a1a`

`Color: #e5e5e5`

`Selected:`

`Background: #252525`

`Color: #e5e5e5`

`Selected + Focused:`

`Background: #1e3a5f`

`Color: #e5e5e5`

`Dragging:`

`Opacity: 0.5`

`Background: #1e3a5f`

`Drop Target:`

`Background: #1e3a5f`

`Border: 1px dashed #3b82f6`

---

## 8. Animation &amp; Transitions
### Timing Functions
`css`

`--ease-linear: linear;`

`--ease-in: cubic-bezier(0.4, 0, 1, 1);`

`--ease-out: cubic-bezier(0, 0, 0.2, 1);`

`--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);`

`--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);`

### Durations
`css`

`--duration-instant: 0ms;`

`--duration-fast: 100ms;`

`--duration-normal: 150ms;`

`--duration-slow: 200ms;`

`--duration-slower: 300ms;`

`--duration-slowest: 500ms;`

### Common Transitions
`css`

`/ Hover states /`

`.interactive {`

`transition: background-color 100ms ease, color 100ms ease, border-color 100ms ease;`

`}`

`/ Modals/Overlays /`

`.modal {`

`transition: opacity 150ms ease, transform 150ms ease;`

`}`

`/ Panels /`

`.panel {`

`transition: width 200ms ease;`

`}`

### Animations
`css`

`/ Loading spinner /`

`@keyframes spin {`

`to {`

`transform: rotate(360deg);`

`}`

`}`

`.spinner {`

`animation: spin 1s linear infinite;`

`}`

`/ Pulse (streaming indicator) /`

`@keyframes pulse {`

`0%,`

`100% {`

`opacity: 1;`

`}`

`50% {`

`opacity: 0.5;`

`}`

`}`

`.streaming {`

`animation: pulse 1.5s ease-in-out infinite;`

`}`

`/ Fade in /`

`@keyframes fadeIn {`

`from {`

`opacity: 0;`

`}`

`to {`

`opacity: 1;`

`}`

`}`

`/ Slide in from right (chat panel) /`

`@keyframes slideInRight {`

`from {`

`transform: translateX(100%);`

`}`

`to {`

`transform: translateX(0);`

`}`

`}`

---

## 9. Icons
### Icon Library
Lucide React (recommended)

- Consistent 24x24 viewbox
- 1.5px stroke width
- MIT licensed

### Icon Sizes

`--icon-xs: 12px // Inline, status indicators`

`--icon-sm: 14px // Sidebar items, buttons`

`--icon-md: 16px // Default`

`--icon-lg: 20px // Activity bar, headers`

`--icon-xl: 24px // Empty states, modals`

`--icon-2xl: 32px // Hero icons`

### Icon Colors
- Inherit from parent text color by default
- Use explicit colors for semantic meaning:

- Folder: #f59e0b

- Success: #22c55e

- Error: #ef4444

- Warning: #f59e0b

---

## 10. Shadows &amp; Elevation
### Shadow Scale
`css`

`--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);`

`--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);`

`--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);`

`--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.4);`

`--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.5);`

### Elevation Layers

`Layer 0: Editor background (no shadow)`

`Layer 1: Sidebar, panels (no shadow, border only)`

`Layer 2: Dropdowns, tooltips (shadow-md)`

`Layer 3: Modals, dialogs (shadow-xl)`

`Layer 4: Notifications, toasts (shadow-lg)`

---

## 11. Z-Index Scale
`css`

`--z-base: 0;`

`--z-dropdown: 100;`

`--z-sticky: 200;`

`--z-fixed: 300;`

`--z-modal-backdrop: 400;`

`--z-modal: 500;`

`--z-popover: 600;`

`--z-tooltip: 700;`

`--z-notification: 800;`

`--z-max: 9999;`

---

## 12. Accessibility
### Focus Management
- All interactive elements must be keyboard accessible
- Focus ring: 2px solid #3b82f6, offset 2px
- Skip links for main content areas
- Logical tab order

### Color Contrast
- Text on background: minimum 4.5:1 (WCAG AA)
- Large text: minimum 3:1
- Interactive elements: minimum 3:1

### Motion
`css`

`@media (prefers-reduced-motion: reduce) {`

`*,`

`*::before,`

`*::after {`

`animation-duration: 0.01ms !important;`

`transition-duration: 0.01ms !important;`

`}`

`}`

### Screen Reader Support
- Proper ARIA labels on interactive elements
- Live regions for status updates
- Semantic HTML structure

---

## 13. Implementation Checklist
### Phase 1: Core Theme ✅
- [x] CSS variables in main.css
- [x] Dark backgrounds on all panels
- [x] Border colors
- [x] Text colors

### Phase 2: Components ✅
- [x] Activity Bar styling
- [x] File Explorer styling
- [x] Editor area styling
- [x] Status bar styling
- [x] Chat panel styling

### Phase 3: Polish (In Progress)
- [x] Hover/active states refinement
- [x] Transitions
- [ ] Icons refinement
- [ ] Loading states
- [ ] Empty states

### Phase 4: Advanced
- [x] Settings modal
- [ ] Multi-agent UI
- [ ] Dropdown menus
- [x] Context menus
- [ ] Notifications/toasts
- [ ] Keyboard shortcuts overlay

---

## 14. Context Menu
### 5.7 Context Menu

`Container:`

`Position: absolute (fixed to viewport)`

`Background: #1a1a1a`

`Border: 1px solid #1f1f1f`

`Border-radius: 6px`

`Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4)`

`Min-width: 160px`

`Padding: 4px`

`Z-index: 1000`

`Menu Item:`

`Height: 32px`

`Padding: 0 12px`

`Font: 13px`

`Color: #a0a0a0`

`Border-radius: 4px`

`Display: flex`

`Align-items: center`

`Gap: 8px`

`Menu Item States:`

`Hover: Background: #252525, Color: #e5e5e5`

`Active: Background: #2a2a2a`

`Disabled: Opacity: 0.4`

`Menu Item Icon:`

`Size: 14px`

`Color: inherit`

`Separator:`

`Height: 1px`

`Background: #1f1f1f`

`Margin: 4px 0`

### Context Menu Items

`File Explorer Context Menu:`

`┌─────────────────────────┐`

`│ 📄 New File Cmd+N │`

`│ 📁 New Folder │`

`├─────────────────────────┤`

`│ ✏️ Rename F2 │`

`│ 🗑️ Delete Del │`

`└─────────────────────────┘`

`Root Folder Context Menu:`

`┌─────────────────────────┐`

`│ 📄 New File Cmd+N │`

`│ 📁 New Folder │`

`└─────────────────────────┘`

---

## 15. Inline Input Component
### 5.8 Inline Input (Rename/Create)

`Container:`

`Display: inline-flex`

`Width: 100%`

`Input:`

`Height: 24px`

`Padding: 2px 6px`

`Background: #1a1a1a`

`Border: 1px solid #3b82f6`

`Border-radius: 4px`

`Font: 13px`

`Color: #e5e5e5`

`Outline: none`

`Box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2)`

`Placeholder:`

`Color: #404040`

`Behavior:`

- `Auto-focus on render`
- `Select all text on focus`
- `Submit on Enter`
- `Cancel on Escape`
- `Cancel on click outside`

---

## 16. Sidebar Header Actions
### 5.9 Sidebar Header

`Container:`

`Height: 40px`

`Padding: 0 8px 0 12px`

`Display: flex`

`Align-items: center`

`Justify-content: space-between`

`Border-bottom: 1px solid #1f1f1f`

`Title:`

`Font: 11px, semibold, uppercase`

`Letter-spacing: 0.05em`

`Color: #666666`

`Actions Container:`

`Display: flex`

`Gap: 4px`

`Action Button:`

`Width: 24px`

`Height: 24px`

`Border-radius: 4px`

`Background: transparent`

`Color: #666666`

`Display: flex`

`Align-items: center`

`Justify-content: center`

`Action Button States:`

`Hover: Background: #1a1a1a, Color: #a0a0a0`

`Active: Background: #252525`

`Icons:`

`Plus (New File): 14px`

`FolderPlus (New Folder): 14px`

---

## 17. Confirmation Dialog
### 5.10 Delete Confirmation Dialog

`Overlay:`

`Background: rgba(0, 0, 0, 0.6)`

`Backdrop-filter: blur(4px)`

`Z-index: 500`

`Dialog:`

`Width: 360px`

`Background: #141414`

`Border: 1px solid #1f1f1f`

`Border-radius: 8px`

`Box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5)`

`Header:`

`Padding: 16px`

`Font: 16px, semibold`

`Color: #e5e5e5`

`Border-bottom: 1px solid #1f1f1f`

`Body:`

`Padding: 16px`

`Font: 14px`

`Color: #a0a0a0`

`Footer:`

`Padding: 12px 16px`

`Display: flex`

`Justify-content: flex-end`

`Gap: 8px`

`Border-top: 1px solid #1f1f1f`

`Cancel Button:`

`Padding: 8px 16px`

`Background: transparent`

`Border: 1px solid #1f1f1f`

`Border-radius: 6px`

`Color: #a0a0a0`

`Font: 13px`

`Delete Button:`

`Padding: 8px 16px`

`Background: #ef4444`

`Border: none`

`Border-radius: 6px`

`Color: #ffffff`

`Font: 13px, medium`

`Button Hover:`

`Cancel: Background: #1a1a1a`

`Delete: Background: #dc2626`

---

## 18. Quick Open Modal
### 5.11 Quick Open (Cmd+P)

`Overlay:`

`Background: rgba(0, 0, 0, 0.5)`

`Backdrop-filter: blur(2px)`

`Container:`

`Width: 500px`

`Max-height: 400px`

`Margin-top: 20vh`

`Background: #141414`

`Border: 1px solid #1f1f1f`

`Border-radius: 8px`

`Box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5)`

`Overflow: hidden`

`Search Input:`

`Height: 48px`

`Padding: 0 16px`

`Background: transparent`

`Border: none`

`Border-bottom: 1px solid #1f1f1f`

`Font: 15px`

`Color: #e5e5e5`

`Outline: none`

`Results List:`

`Max-height: 350px`

`Overflow: auto`

`Padding: 4px`

`Result Item:`

`Height: 36px`

`Padding: 0 16px`

`Display: flex`

`Align-items: center`

`Gap: 12px`

`Border-radius: 4px`

`Color: #a0a0a0`

`Font: 13px`

`Result Item States:`

`Hover: Background: #1a1a1a`

`Selected: Background: #1e3a5f, Color: #e5e5e5`

`File Icon:`

`Size: 14px`

`Color: varies by file type`

`File Path (secondary):`

`Font: 11px`

`Color: #666666`

`Margin-left: auto`

`Empty State:`

`Padding: 24px`

`Text-align: center`

`Color: #666666`

`Font: 13px`

---

## 19. Tabs Bar
### 5.12 Tabs

`Container:`

`Height: 40px`

`Background: #141414`

`Border-bottom: 1px solid #1f1f1f`

`Display: flex`

`Overflow-x: auto`

`Tab:`

`Min-width: 120px`

`Max-width: 200px`

`Height: 40px`

`Padding: 0 12px 0 16px`

`Display: flex`

`Align-items: center`

`Gap: 8px`

`Background: transparent`

`Border-bottom: 2px solid transparent`

`Color: #666666`

`Font: 13px`

`Cursor: pointer`

`Tab States:`

`Hover: Background: #1a1a1a, Color: #a0a0a0`

`Active: Background: #0d0d0d, Color: #e5e5e5, Border-bottom-color: #3b82f6`

`Tab Close Button:`

`Width: 18px`

`Height: 18px`

`Border-radius: 4px`

`Background: transparent`

`Color: #666666`

`Opacity: 0 (visible on tab hover)`

`Tab Close Button Hover:`

`Background: #252525`

`Color: #e5e5e5`

`Modified Indicator:`

`Width: 8px`

`Height: 8px`

`Border-radius: 50%`

`Background: #e5e5e5`

`(replaces close button when file is modified)`

---

## 20. File Watcher Indicator
### Status Bar File Watch Status

`Position: Right side of status bar`

`Display: flex`

`Align-items: center`

`Gap: 4px`

`Icon:`

`Size: 12px`

`Animation: pulse (when syncing)`

`Text:`

`Font: 11px`

`Color: #666666`

`States:`

`Watching: Icon: Eye, Color: #22c55e`

`Syncing: Icon: RefreshCw (animated), Color: #f59e0b`

`Error: Icon: AlertCircle, Color: #ef4444`

``dd.