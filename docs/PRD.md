# OObsidian Product Requirements Document (PRD)

## 1. Product Overview

**Name**: OObsidian
**Type**: Desktop Application (Mac, Windows, Linux)
**One-liner**: 연구자/창작자를 위한 AI 노트 IDE (Cursor + Obsidian 스타일)

**Target Users**:
- 대학원생, 연구자
- 작가, 콘텐츠 기획자
- 지식 노동자

**Key Scenarios**:
1. 논문 초안/발표 준비
2. 연구 노트/아이디어 기록
3. 글쓰기/콘텐츠 기획

**Design Philosophy**:
- **Offline-first**: All core features work without internet
- **Lightweight Core**: Fast, minimal base app
- **Plugin-based Extensibility**: Advanced features as optional plugins
- **No Lock-in**: Plain markdown files, no proprietary format
- **Privacy-first**: Local data, proxy doesn't store content

**Key Differentiators**:
- Multi-AI provider support (GPT-4.1, GPT-4o, Claude, Gemini)
- Beautiful dark-first UI inspired by Cursor/Obsidian
- Korean market friendly (manual licensing option)
- Managed AI proxy (no API key hassle for users)

---

## 2. Technical Stack

### Core Technologies

| Layer | Technology |
| -------- | ---------------------------------- |
| Desktop | Electron 39.x |
| Frontend | React 19 + TypeScript 5.9 |
| Styling | TailwindCSS 4.x (dark theme only) |
| Build | electron-vite |
| Editor | TipTap (ProseMirror-based WYSIWYG) |
| Icons | Lucide React |
| Layout | react-resizable-panels |

### Data Storage

- **Files**: Local File System (Markdown .md files)
- **Config**: electron-store (JSON-based settings)
- **Vector DB** (Future): SQLite + local embeddings for RAG

### AI Integration

**Supported Providers** (Managed API - 사용자 API 키 입력 불필요):

| Provider | Models | Status |
| --------- | -------------------------------- | -------- |
| OpenAI | GPT-5, GPT-5-mini, GPT-4.1, GPT-4o | ✅ 현재 |
| Anthropic | Claude 3.5/4 Sonnet | v1.1+ |
| Google | Gemini 2.0 | v1.1+ |

---

## 3. Key Features

### 3.1 Editor & File System

#### Rich Markdown Editor (TipTap) ✅

- **WYSIWYG Editing**: Real-time markdown rendering
- **Rich/Raw Toggle**: Switch between WYSIWYG and raw markdown
- **Syntax Highlighting**: Code blocks with language detection
- **Block Types**: Headings, lists, quotes, code blocks
- **Keyboard Shortcuts**: Full markdown shortcuts (Cmd+B for bold, etc.)
- **Typography Extension**: Smart quotes, dashes
- **Dynamic Placeholders**: Context-aware placeholders for headings
- **Obsidian-style Headings**: ### preview → h3 on Enter ✅
- **Internal Links**: `[[note]]` syntax with navigation ✅
- **Click to Focus**: Click anywhere in editor area to activate cursor ✅

#### File Explorer ✅

- **Tree View**: Hierarchical folder structure
- **Context Menu**: Right-click for New File, New Folder, Rename, Delete ✅
- **Header Buttons**: + (New File), Folder+ (New Folder) ✅
- **Inline Rename**: Click to edit filename ✅
- **Quick Open**: Cmd+P fuzzy file search ✅
- **Hidden Files**: Filter system files (.git, node_modules)
- **File Watcher**: Real-time refresh on external changes ✅
- **Document Filter**: Show only .md and .pdf files ✅

#### Auto-Save ✅

- **Debounced Save**: 500ms delay after typing stops
- **Save Indicator**: Visual feedback in status bar

### 3.2 AI Intelligence System

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    OObsidian App                        │
│                                                         │
│      callLLM({ mode, context, prompt })                 │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────┐               │
│  │       Unified AI API Layer          │               │
│  │       - provider selection          │               │
│  │       - context injection           │               │
│  │       - streaming handler           │               │
│  └──────────────┬──────────────────────┘               │
└─────────────────┼───────────────────────────────────────┘
                  │ HTTPS + JWT
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Proxy API Gateway                       │
│               - Auth & Plan check                       │
│               - Usage tracking (tokens only)            │
│               - LLM routing                             │
│               - Rate limiting                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               LLM Provider APIs                         │
│           (OpenAI / Anthropic / Google)                 │
└─────────────────────────────────────────────────────────┘
```

#### AI Workflows ✅

Representative Workflows (2-3 patterns, extremely polished):

1. **Selection → AI Action (Cmd+K / Cmd+Shift+A)**
   - 요약 (Summarize)
   - 다듬기 (Polish/Improve)
   - 영어로 번역 (Translate to English)
   - TODO 리스트 추출 (Extract TODOs)

2. **Full File → AI Question**
   - "이 노트 내용을 기반으로 발표 스크립트 만들어줘"
   - "이 논문 초안을 섹션별로 정리해줘"

3. **New Document Generation (Future)**
   - "새 노트: XX에 대한 개요 노트 만들어줘"

#### Context Modes ✅

- **No Context**: General chat without file access
- **Current File**: Send active document to AI
- **Selected Text**: Send highlighted text only

### 3.3 Chat Interface ✅

#### Chat Sidebar

- **Message History**: Scrollable conversation
- **Streaming Responses**: Real-time token display
- **Code Blocks**: Syntax-highlighted with copy button
- **Markdown Rendering**: Full markdown in responses
- **Model Selection**: Dropdown to choose model
- **Quick Actions**: 요약, 다듬기, 번역, TODO 추출

### 3.4 Core Productivity Features

> Design Goal: Keep core lightweight. Advanced features as plugins.

#### Minimal Note-Taking Essentials (Core) ✅

- [x] Internal Links: `[[note]]` syntax with navigation
- [x] Global Search: Cmd+P fuzzy file search
- [x] Tabs: Multiple open files with tab bar
- [x] Context Menu: File/folder create, delete, rename
- [x] File Watcher: Auto-refresh on external changes
- [x] Backlinks: Notes linking to current note panel
- [ ] Tags: YAML frontmatter `tags: [research, stats]`
- [ ] Daily Notes: Cmd+D for today's note

#### Advanced Features (Plugins - v1.1+)

- Tag Panel
- Daily Notes
- Graph View
- Advanced Search
- Ontology/Knowledge Graph

### 3.5 PDF Integration (v0.4)

#### PDF → Markdown Conversion

- **Text Extraction**: Basic PDF text extraction
- **OCR Support**: Image-based PDF text recognition
  - Local OCR (Tesseract.js): Free tier, offline
  - Cloud OCR (Google Vision): Pro tier, higher accuracy
- **Context Menu**: Right-click PDF → "Extract to Markdown" / "Summarize with AI"

#### PDF Context Menu Options

```
PDF 우클릭 메뉴:
┌─────────────────────────┐
│ 📄 Open PDF Viewer      │
│ 📝 Extract to Markdown  │
│ ✨ Summarize with AI    │ ← Pro 기능
│ 🔍 Add to RAG Context   │ ← v1.1+
└─────────────────────────┘
```

### 3.6 Templates System (v0.4)

#### Template Picker on New File

새 노트 생성 시 노션 스타일의 템플릿 선택 UI:

```
┌─────────────────────────────────────────────┐
│ Choose a Template                        ✕  │
├─────────────────────────────────────────────┤
│                                             │
│  📄 Blank Note                              │
│     빈 노트로 시작                          │
│                                             │
│  📑 Paper Notes                             │
│     논문 읽기 노트 템플릿                   │
│                                             │
│  📋 Meeting Notes                           │
│     회의록 템플릿                           │
│                                             │
│  📅 Daily Note                              │
│     오늘의 노트 템플릿                      │
│                                             │
│  💡 Project Overview                        │
│     프로젝트 개요 템플릿                    │
│                                             │
└─────────────────────────────────────────────┘
```

#### Template Behavior

- **Trigger**: Cmd+N 또는 New File 버튼 클릭 시 템플릿 선택창 표시
- **Quick Dismiss**: ESC 또는 "Blank Note" 선택으로 빈 노트 생성
- **Slash Command**: 에디터 내에서 `/template` 입력 시에도 템플릿 삽입 가능

#### Built-in Templates (MVP)

| Template | 용도 | 내용 |
| ---------------- | ------------------- | ------------------------------------------- |
| Blank Note | 기본 | 빈 노트 |
| Paper Notes | 논문 읽기 | Title, Authors, Abstract, Key Points, Notes |
| Meeting Notes | 회의록 | Date, Attendees, Agenda, Action Items |
| Daily Note | 일일 기록 | Date header, Tasks, Notes, Reflections |
| Project Overview | 프로젝트 기획 | Objective, Timeline, Tasks, Resources |

#### Custom Templates (v1.1+)

- 사용자 정의 템플릿 저장
- 템플릿 변수 지원: `{{date}}`, `{{title}}`, `{{author}}`
- 템플릿 폴더 지정 (`.templates/`)

### 3.7 Settings & Configuration ✅

#### AI Provider (Managed)

> Design Goal: 사용자가 API 키를 직접 관리할 필요 없이 바로 AI 기능 사용 가능

**현재 지원 모델:**
- GPT-5-mini (OpenAI) - 기본 (빠르고 효율적)
- GPT-5 (OpenAI) - 가장 강력한 모델
- GPT-4.1 (OpenAI) - 이전 세대
- GPT-4o (OpenAI) - 멀티모달 모델

**향후 추가 예정 (v1.1+):**
- Claude 3.5/4 Sonnet (Anthropic)
- Gemini 2.0 (Google)

```
┌────────────────────────────────────────┐
│            AI Settings                 │
├────────────────────────────────────────┤
│  Model: GPT-5-mini (OpenAI)        ▼   │
│                                        │
│  ✓ AI 기능이 활성화되어 있습니다       │
└────────────────────────────────────────┘
```

- **Managed API**: 서비스에서 API 키 제공 (사용자 입력 불필요)
- **BYOK Mode (v1.1+)**: 고급 사용자용 자체 API 키 옵션

### 3.8 Privacy & Security

- **Local-First**: All notes stored locally, never uploaded
- **Proxy Privacy**: Server doesn't store prompts/responses
- **Stored Data**: Only user_id, model, token counts, timestamp
- **No Telemetry**: Zero analytics without consent
- **Path Validation**: Prevent directory traversal attacks

---

## 4. Backend Architecture

### 4.1 Backend Responsibilities (Minimal)

1. **인증 (Auth)**: 사용자 로그인/회원가입
2. **구독/플랜 (Plan)**: FREE / PRO / RESEARCH_PRO
3. **토큰 사용량 (Usage)**: 월별 사용량 추적
4. **결제 정보 (Payment)**: 결제 기록
5. **LLM 프록시**: 모든 AI 호출 중계 + 사용량 기록

### 4.2 Database Schema

```sql
-- 사용자
users
  - id (PK)
  - email (UNIQUE)
  - password_hash
  - plan (FREE / PRO / RESEARCH_PRO)
  - created_at

-- 구독 정보
subscriptions
  - id (PK)
  - user_id (FK)
  - plan
  - status (active / expired / canceled)
  - current_period_end
  - created_at

-- 토큰 사용량
usage_logs
  - id (PK)
  - user_id (FK)
  - provider (openai / anthropic / google)
  - model
  - prompt_tokens
  - completion_tokens
  - total_tokens
  - created_at

-- 결제 기록
payments
  - id (PK)
  - user_id (FK)
  - method (bank_transfer / stripe / etc)
  - amount
  - currency
  - status (pending / confirmed)
  - paid_at
  - note

-- 플랜별 제한 (Optional)
plan_limits
  - plan
  - provider
  - model
  - max_tokens_per_month
```

### 4.3 API Endpoints

```
Auth
  POST /auth/signup
  POST /auth/login
  GET  /me

Billing
  GET  /plans
  GET  /billing/usage
  POST /billing/subscribe

AI (LLM Proxy)
  POST /ai/chat     ← 모든 LLM 호출은 여기로
  GET  /ai/models   ← 사용 가능한 모델 목록
```

### 4.4 LLM Proxy Flow

```
1. 클라이언트 → /api/chat 요청 (JWT 포함)
2. 서버에서 user_id + plan 확인
3. 이번 달 usage_logs 토큰 합계 확인
4. 플랜 한도 넘었으면 에러/업셀 메시지
5. 아니면 OpenAI/Claude/Gemini에 요청
6. 응답 받고 → usage_logs에 토큰 기록
7. 클라이언트로 스트리밍/전달
```

### 4.5 Security & Privacy

**데이터 저장 정책:**
- 프롬프트/응답 본문은 서버에 저장하지 않음
- 저장 데이터: user_id, model, token counts, timestamp만

**서버 로깅:**
- Access log에 prompt/response 미포함
- Error log는 status code/trace만

**통신 보안:**
- 모든 통신 TLS 1.2+
- HSTS 활성화
- API 키는 서버 환경변수로만 관리

### 4.6 Rate Limiting & Abuse Prevention

- 사용자별 초당/분당 호출 제한
- 플랜별 월 토큰 한도
- Circuit Breaker (30초 timeout)
- 자동 스팸 탐지

---

## 5. Subscription Model

### Free Tier

- Full local functionality
- BYOK (Bring Your Own Keys) only
- Single-agent mode
- Basic features
- Community support

### Pro Tier ($12/month or $99/year)

- Managed API keys (no BYOK needed)
- Multi-model access (GPT-5, GPT-4o, Claude)
- Higher token limits
- Priority support

### Research Pro Tier ($20/month)

- Everything in Pro
- Priority model access
- Higher rate limits
- Advanced features (when available)

### Manual Payment Option (Korean Market)

- Bank transfer support
- Manual license key issuance
- Email receipt/invoice
- 1-year or Lifetime license options
- Offline license verification

---

## 6. User Flows

### 6.1 First Launch

```
1. App Start
   └─→ Check saved vault path
       ├─→ Valid: Load vault
       └─→ Invalid/None: Use default path (~/Documents/OObsidian)
```

### 6.2 Writing Flow

```
1. Click file in sidebar OR Cmd+N for new file
   - Or right-click → New File
   - Or click + button in sidebar header
2. Start typing markdown
   - ### for h3 heading (shows preview size)
   - Press Enter to convert to actual heading
3. Auto-save triggers after 500ms
4. See "Saved" indicator in status bar
```

### 6.3 AI Chat Flow

```
1. Click AI icon in activity bar (or Cmd+Shift+A)
2. Chat panel opens
3. Select model from dropdown
4. Choose context mode (None / File / Selection)
5. Type question → Enter (or use Quick Actions)
6. See streaming response
```

### 6.4 File Management Flow

```
1. Right-click on file/folder
2. Context menu appears:
   - New File
   - New Folder
   - Rename
   - Delete
3. Select action
4. For rename: inline input appears
5. For delete: confirmation dialog
```

---

## 7. Non-Functional Requirements

### Performance

| Metric | Target |
| -------------- | ----------------------------- |
| App Launch | < 2 seconds |
| File Open | < 100ms |
| Typing Latency | < 16ms |
| AI First Token | < 1s (cloud) |
| Memory Usage | < 300MB idle |
| Large Vault | 10k+ files supported |

### Offline-First Guarantee

- All core features work without internet
- AI requests check provider availability
- Clear offline/online status indicator

### Security

- Electron security best practices
- Context isolation enabled
- No remote code execution
- Sandboxed renderer process
- Path validation (prevent directory traversal)

---

## 8. Competitive Analysis

| Feature | OObsidian | Obsidian | Notion | Cursor |
| ------------- | --------- | -------- | ------- | -------- |
| Local-first | ✓ | ✓ | ✗ | ✓ |
| Offline-first | ✓ | ✓ | ✗ | Partial |
| Multi-AI | ✓ | ✗ | ✗ | ✗ |
| WYSIWYG | ✓ | ✓ | ✓ | ✗ |
| Context Menu | ✓ | ✓ | ✓ | ✓ |
| No Lock-in | ✓ | ✓ | ✗ | ✓ |
| Dark Theme | ✓ | ✓ | ✓ | ✓ |
| Managed AI | ✓ | ✗ | ✓ | ✓ |
| Price | Free/$12 | Free/$8 | Free/$8 | Free/$20 |

---

## 9. Milestones

### MVP (v0.1) - Completed ✅

- [x] Basic file explorer
- [x] Simple markdown editor
- [x] AI chat integration (Ollama)
- [x] Dark theme UI

### Alpha (v0.2) - Completed ✅

- [x] Rich WYSIWYG editor (TipTap)
- [x] File operations (create/rename/delete)
- [x] Folder operations (create via context menu)
- [x] Context menu (right-click)
- [x] Keyboard shortcuts
- [x] Auto-default vault path
- [x] Settings panel with API key management
- [x] Quick Open (Cmd+P)
- [x] Tabs for multiple files
- [x] Internal links `[[note]]` syntax
- [x] File watcher (real-time refresh)
- [x] Obsidian-style heading input

### Beta (v0.3) - Completed ✅

- [x] OpenAI API integration (GPT-5, GPT-5-mini, GPT-4.1, GPT-4o)
- [x] Context injection (current file/selection)
- [x] AI Quick Actions (Summarize, Polish, Translate, Extract TODOs)
- [x] Backlinks panel
- [x] Click anywhere to focus editor
- [x] File explorer filter (md/pdf only)
- [ ] Status indicator (plan/usage)

### Beta (v0.4) - PDF & Templates

- [ ] PDF text extraction (basic)
- [ ] PDF → Markdown conversion
- [ ] Template picker on new file (Notion-style)
- [ ] Built-in templates (5개)
- [ ] OCR support (local Tesseract.js)

### Release (v1.0)

- [ ] Proxy server integration
- [ ] Licensing/subscription
- [ ] Auto-updater
- [ ] Installer packages

### Future (v1.1+)

- [ ] Plugin system
- [ ] Multi-agent system
- [ ] Tags & Daily Notes
- [ ] Graph View

---

## 10. Import/Export

### Import

- **Obsidian Vaults**: Use existing Obsidian vaults directly
- **Plain Markdown**: Any folder of .md files
- **No Migration Needed**: Just point to your folder

### Export

- **No Lock-in**: All data is plain markdown
- **Backup Export**: Full vault zip export (planned)

---

## 11. Future Considerations

- **Mobile App**: React Native companion app
- **Cloud Sync**: Optional encrypted sync
- **Real-time Collaboration**: Shared editing
- **Voice Input**: Whisper-based voice-to-text
- **Calendar Integration**: Daily notes, scheduling
- **Web Clipper**: Browser extension for saving content
