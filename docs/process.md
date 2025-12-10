# Development Process & Roadmap

> **Design System**: See [design.md](./design.md) for complete UI specifications.
> **Product Requirements**: See [prd.md](./prd.md) for full feature details.

---

## Phase 1: Foundation & Setup ✅

- [x] **Project Initialization**: Electron + Vite + React + TypeScript
- [x] **Styling System**: TailwindCSS with custom dark theme
- [x] **Core Layout**: VSCode-inspired layout (Activity Bar, Sidebar, Editor, Panel)
- [x] **Design System**: Created design.md with color palette, typography, spacing

---

## Phase 2: Essential Editor ✅

- [x] **File System Access**: IPC bridges for read/write/list operations
- [x] **Path Validation**: Security checks to prevent directory traversal
- [x] **Markdown Editor**: TipTap WYSIWYG editor with Rich/Raw toggle
- [x] **Vault Management**: Folder picker + auto-default path
- [x] **Hidden Files**: Filter out .git, node_modules, dist, etc.
- [x] **File Operations**: Create, delete, rename files via IPC
- [x] **Keyboard Shortcuts**: Cmd+N (new), Cmd+O (open), Cmd+Shift+A (chat)

---

## Phase 3: AI Integration (In Progress)

### 3.1 Offline AI (Fallback-first Architecture)

- [x] **Ollama Integration**: HTTP streaming to local Ollama API
- [x] **Chat UI**: ChatGPT-style interface in right sidebar
- [x] **Model Selection**: Dropdown to choose between Ollama models
- [x] **Streaming Responses**: Real-time token streaming
- [x] **Error Handling**: Connection errors, timeouts, model not found
- [x] **Ollama Presence Check**: Auto-detect in Settings panel
- [x] **Settings Panel**: API key management UI
- [ ] **Ollama Missing Dialog**: Install guide + system compatibility check
- [ ] **Ollama Auto-Config**: Auto-pull default model if none exists
- [ ] **AI Provider Priority System**:
  1. Local (Ollama if available)
  2. Online (OpenAI/Groq/Gemini/Claude)
  3. Fallback with error message

### 3.2 Online AI Providers (Planned)

- [ ] **Provider Abstraction**: Unified AI adapter interface
- [ ] **OpenAI Adapter**: GPT-4o, GPT-4 Turbo, GPT-3.5
- [ ] **Anthropic Adapter**: Claude 3.5 Sonnet, Claude 3 Opus
- [ ] **Google Adapter**: Gemini Pro, Gemini Ultra
- [ ] **Groq Adapter**: Fast inference (Llama 3 70B, Mixtral)
- [x] **API Key Management**: Secure storage with localStorage (upgrade to electron-store planned)
- [x] **Provider Selector**: UI to switch between providers in Settings

### 3.3 Multi-Agent System (Planned)

- [ ] **Agent Framework**: Base agent class with configurable roles
- [ ] **Orchestrator**: Parallel query dispatch to multiple agents
- [ ] **Agent Types**:
  - Architect (high-level design)
  - Developer (implementation)
  - Reviewer (critical analysis)
  - Researcher (web search)
  - Writer (prose improvement)
- [ ] **Response Aggregator**: Merge/synthesize multiple responses
- [ ] **Council Mode UI**: Show parallel agent responses side-by-side
- [ ] **Consensus Mode**: Agents debate, produce unified output

### 3.4 Context Injection (Planned)

- [ ] **Current File Mode**: Send active document to AI
- [ ] **Selected Text Mode**: Send highlighted text only
- [ ] **Folder Context**: Include all files in current folder
- [ ] **RAG Pipeline**: Vector search across vault (future)

---

## Phase 4: LLM Proxy Architecture (Planned)

### 4.1 개요

모든 LLM 호출은 OObsidian App → Proxy Server(API Gateway) → OpenAI/Anthropic/Gemini로 전달된다.
사용자는 "API 키"를 직접 다루지 않으며, 모든 AI 사용은 서버에서 제공하는 안전한 Proxy API로 처리된다.

**이 방식의 장점:**

- 사용자는 API 키 개념을 몰라도 사용 가능
- 불법 공유/악성 스크립트로 인한 API 키 유출 문제 방지
- 토큰 사용량 추적 및 구독 기반 과금 모델 구현
- GDPR 친화적 설계: 사용자 노트 내용을 서버에 저장하지 않음
- 보안, 로깅, 속도 제어(QoS), abuse 방지 기능을 중앙에서 통제 가능

### 4.2 데이터 흐름 (End-to-End)

```
[사용자 OObsidian App]
     ↓ HTTPS
[Proxy Server - API Gateway]
     ↓ API Key (Server-side secure)
[OpenAI / Anthropic / Google API]
```

### 4.3 데이터 유출 방지 설계

**프롬프트/문서 내용 서버 저장 금지:**

- Proxy 서버는 요청/응답 본문을 저장하지 않는다.
- 저장하는 데이터는 다음으로 제한:
  - user_id
  - model_name
  - token_count_input
  - token_count_output
  - request_timestamp
  - billing metadata

**서버 내 로깅 정책:**

- Access log에 prompt, response를 남기지 않음
- Debug log는 운영 환경에서 비활성화
- Error log는 메시지 텍스트 없이 status code/trace만 기록

**전송 중 데이터 보호:**

- 모든 통신은 TLS 1.2 이상 사용
- MITM 공격 방지를 위한 HSTS 활성화
- 서버 간 내부 호출도 HTTPS 강제

**API 키 보관:**

- AI Provider API Keys(OpenAI, Anthropic, Google)는 서버 환경변수로만 저장
- Git 리포지토리에 절대 포함되지 않음
- Key rotation 자동화 고려

### 4.4 Abuse 방지 & Rate Limit

- 사용자별 초당/분당 호출 제한
- 구독별 허용 토큰 량 조절
- 자동 스팸 탐지 (짧은 시간 내 반복 호출 방지)
- Timeouts(예: 30초) & Circuit Breaker 적용

### 4.5 오류 처리 로직

- LLM Provider API 오류 → 사용자에게 명확한 코드 반환
- Proxy 오류 → 재시도 후 사용자에게 fallback 응답
- 네트워크 오류 → retry 2회 후 timeout

### 4.6 GDPR Ready 프로세스

- 사용자의 노트 내용/프롬프트는 단순 중계 후 즉시 폐기
- 서비스는 사용자 문서를 데이터베이스에 저장하지 않는다
- 사용자는 언제든 Personal Data 삭제 요청 가능 (계정/빌링 정보)
- 모든 데이터는 EU/한국 GDPR 등 규제 준수 방식으로 처리

---

## Phase 5: Rich Editor ✅

### 5.1 WYSIWYG Markdown

- [x] **TipTap Integration**: ProseMirror-based editor
- [x] **Live Rendering**: Markdown syntax transforms in-place
- [x] **Syntax Highlighting**: Code blocks with lowlight
- [x] **Rich/Raw Toggle**: Switch between WYSIWYG and raw markdown
- [x] **Typography Extension**: Smart quotes, dashes
- [x] **Dynamic Placeholders**: Different placeholders for headings, paragraphs
- [ ] **Tables**: Visual table editor
- [ ] **Callouts**: Obsidian-style callout blocks
- [ ] **Math Blocks**: KaTeX rendering

### 5.2 Editor Features (Planned)

- [ ] **Slash Commands**: `/` menu for quick block insertion
- [ ] **Link Preview**: Hover to preview linked notes
- [ ] **Image Support**: Drag & drop, paste from clipboard

---

## Phase 6: AI File Operations (Planned)

### 6.1 Basic Operations

- [ ] **Create File**: AI generates new documents from prompts
- [ ] **Edit File**: AI modifies existing content
- [ ] **Rename File**: Smart rename suggestions
- [ ] **Move File**: Organize into folders

### 6.2 Batch Operations

- [ ] **Summarize Folder**: Create summary of multiple files
- [ ] **Bulk Rename**: AI-powered file naming
- [ ] **Content Organization**: Suggest folder structure

### 6.3 Safety

- [ ] **Confirmation Dialogs**: All destructive ops require approval
- [ ] **Undo History**: Revert AI-made changes
- [ ] **Preview Mode**: Show changes before applying
- [ ] **File Backup**: Auto-backup before batch operations

---

## Phase 7: Core Productivity Features ✅

> **Design Goal**: Keep core app lightweight and fast. Advanced features as plugins.

### 7.1 Minimal Note-Taking Essentials

- [ ] **Backlinks** (basic): Show notes linking to current note
- [x] **Internal Links**: `[[note]]` syntax with navigation
- [x] **Global Search**: Cmd+P fuzzy file search
- [x] **Tabs**: Multiple open files with tab bar

### 7.2 UI Polish

- [x] **Settings Panel**: User preferences modal with API key management
- [ ] **Sort Options**: Name, date modified, date created
- [ ] **Persisted State**: Last opened file, window position

---

## Phase 8: Licensing & Payments (Planned)

### 8.1 Initial Manual Licensing (Korean Market Friendly)

- [ ] **Manual Payment Option**: Bank transfer support
- [ ] **License Key Activation**: Settings panel input
- [ ] **Offline License Verification**: Hash-based validation
- [ ] **License Tiers**: 1-year license or Lifetime option

### 8.2 Future: Automated Licensing

- [ ] **Stripe/Paddle Integration**: Automated payments
- [ ] **Auto-Updater**: electron-updater integration
- [ ] **Subscription Tiers**: Free, Pro, Research Pro
- [ ] **Packaging**: Build .app / .exe / .AppImage

---

## Phase 9: Plugin System (Planned)

### 9.1 Plugin Architecture

- [ ] **Plugin Loader**: /plugins folder scanning
- [ ] **Plugin Manifest**: manifest.json for metadata
- [ ] **Plugin API**:
  - Menu/command registration
  - Panel registration
  - File/note event hooks
  - Editor extension API (TipTap extensions)
- [ ] **Plugin Settings**: Per-plugin settings UI

### 9.2 Official Plugins (Bundled)

- [ ] **Tag Panel Plugin**: Tag browser and management
- [ ] **Daily Notes Plugin**: Auto-create daily notes
- [ ] **Advanced Search Plugin**: Full-text search with filters
- [ ] **Graph View Plugin**: Note relationship visualization

### 9.3 Extension Pack (Pro)

- [ ] **Ontology Plugin**: Goal/Project/Task/Topic/Insight/Question
- [ ] **Concept Extraction**: AI-powered concept detection
- [ ] **Knowledge Graph**: SKOS-based relationships

### 9.4 Marketplace (Future)

- [ ] Plugin discovery and installation
- [ ] Version update management
- [ ] Community plugin support

---

## Phase 10: Knowledge & Ontology Extensions (Pro Extension)

> **Note**: Separated from core for lightweight base app.

### 10.1 Concept Extraction (AI)

- [ ] Auto-extract concepts from note content
- [ ] Note ↔ Concept linking
- [ ] Auto-tag suggestions

### 10.2 SKOS-based Ontology

- [ ] Entity types: Goal / Project / Task / Topic / Person / Resource
- [ ] Auto-generate relationships (broader/narrower/related)

### 10.3 Advanced Graph View

- [ ] Ontology-based visual graph
- [ ] Mixed note/concept network
- [ ] Filter by entity type

---

## Phase 11: Import/Export (Planned)

### 11.1 Import

- [ ] **Obsidian Compatibility**: Use existing Obsidian vaults
- [ ] **Plain Markdown**: Any folder of .md files

### 11.2 Export

- [ ] **No Lock-in**: All data stays as plain markdown
- [ ] **Backup Export**: Full vault zip export

---

## Phase 12: Performance & Offline-first (Planned)

### 12.1 Offline-first Guarantee

- [ ] All core features work without internet
- [ ] AI requests check provider availability
- [ ] Local AI fallback with user guidance

### 12.2 Vault Performance

- [ ] Large vault indexing (10k+ files)
- [ ] Fast fuzzy search
- [ ] Lazy loading for file tree

---

## Phase 13: Onboarding & UX Polish (Planned)

- [ ] First-run tutorial
- [ ] Keyboard shortcut hints
- [ ] Tooltips for all actions
- [ ] Welcome screen improvements

---

## Phase 14: Optional Metrics & Beta Channels (Future)

- [ ] Opt-in usage analytics
- [ ] Beta update channel
- [ ] Crash reporting (opt-in)

---

## Technical Decisions

### Stack

| Component | Technology             | Version |
| --------- | ---------------------- | ------- |
| Desktop   | Electron               | 39.x    |
| Frontend  | React                  | 19      |
| Language  | TypeScript             | 5.9     |
| Build     | electron-vite          | -       |
| Styling   | TailwindCSS            | 4.x     |
| Icons     | Lucide React           | -       |
| Layout    | react-resizable-panels | -       |
| Editor    | TipTap                 | 3.x     |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Electron Main Process                  │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│ │  File I/O   │ │ AI Manager  │ │ Settings Store  │    │
│ │ handlers.ts │ │  ollama.ts  │ │ electron-store  │    │
│ └─────────────┘ └─────────────┘ └─────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                    Preload Script                       │
│                 (Context Bridge API)                    │
├─────────────────────────────────────────────────────────┤
│                   Renderer Process                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│ │   App.tsx   │ │ Components  │ │  Hooks/Utils    │    │
│ │  (Router)   │ │    (UI)     │ │    (Logic)      │    │
│ └─────────────┘ └─────────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### AI Architecture (Local + Proxy)

```
┌─────────────────────────────────────────────────────────┐
│                      AI Manager                         │
├─────────────────────────────────────────────────────────┤
│  Priority: Local (Ollama) → Proxy Server → Error        │
│                                                         │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ Ollama  │  │ Proxy Server │  │  Direct BYOK    │    │
│  │ (Local) │  │  (Managed)   │  │ (User's Keys)   │    │
│  └────┬────┘  └──────┬───────┘  └────────┬────────┘    │
│       │              │                    │             │
│       └──────────────┴────────────────────┘             │
│                      │                                  │
│       ┌──────────────┴──────────────┐                  │
│       │      Unified AI API         │                  │
│       │   - chat() / stream()       │                  │
│       │   - listModels()            │                  │
│       └─────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### LLM Proxy Server Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   OObsidian App                         │
│              (User Action: Chat/Summarize)              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Proxy API Gateway                      │
│  - Auth & Billing (JWT)                                 │
│  - Minimal Logging (no content)                         │
│  - Model Routing                                        │
│  - Rate Limiting & Abuse Detection                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              LLM Provider APIs                          │
│     (OpenAI / Anthropic / Gemini / Groq)               │
└─────────────────────────────────────────────────────────┘
```

### Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Orchestrator                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Query ──┬──▶ Agent 1 (GPT-4)   ──┐               │
│               ├──▶ Agent 2 (Claude)  ──┼──▶ Aggregator │
│               └──▶ Agent 3 (Llama)   ──┘               │
│                                          │              │
│                                          ▼              │
│                                   Final Response        │
└─────────────────────────────────────────────────────────┘
```

### Plugin Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Plugin System                        │
├─────────────────────────────────────────────────────────┤
│  /plugins                                               │
│    ├── tag-panel/                                       │
│    │     ├── manifest.json                              │
│    │     └── index.js                                   │
│    ├── daily-notes/                                     │
│    └── graph-view/                                      │
├─────────────────────────────────────────────────────────┤
│                      Plugin API                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Commands   │ │   Panels    │ │  Editor Ext.    │   │
│  │ registerCmd │ │  addPanel   │ │  addTipTapExt   │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Design Philosophy

- Dark-first UI (no light mode)
- Minimal visual noise
- Obsidian/Cursor/Antigravity inspired
- Content-focused editing experience
- Offline-first: Core features work without internet
- Plugin-based extensibility: Keep core lightweight
- No lock-in: Plain markdown files
- Privacy-first: Local data, optional cloud AI

---

## Recent Changes (Dec 2024)

### Editor Upgrade

1. TipTap WYSIWYG editor with Rich/Raw toggle
2. Syntax highlighting for code blocks
3. Markdown ↔ HTML conversion
4. Typography extension for smart quotes
5. Dynamic placeholders for headings

### Core Features

1. Settings Panel with API key management
2. Ollama auto-detection in Settings
3. Quick Open (Cmd+P) fuzzy file search
4. Tabs for multiple open files
5. Internal links `[[note]]` syntax support

### Component Architecture

1. Extracted ActivityBar component
2. Extracted StatusBar component
3. Created QuickOpen, TabBar, SettingsPanel components
4. WikiLink TipTap extension

### File System

1. Folder picker dialog
2. Auto-default vault path
3. Create/delete/rename file operations
4. Keyboard shortcuts (Cmd+N, Cmd+O, Cmd+Shift+A, Cmd+P, Cmd+W)

### Code Quality

1. ESLint configuration fixes
2. TypeScript strict mode compliance
3. Path validation security
4. Zoom controls disabled for consistent UI

---

## Next Steps (Priority Order)

1. **Multi-Provider**: Add OpenAI/Anthropic adapters with actual API calls
2. **Proxy Server**: Design and implement LLM proxy for managed AI access
3. **Context Injection**: Send current file/selection to AI
4. **Backlinks Panel**: Show notes linking to current note
5. **Plugin System**: Basic plugin loader
