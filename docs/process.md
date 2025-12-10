# Development Process & Roadmap

> **Design System**: See [design.md](./design.md) for complete UI specifications.
> **Product Requirements**: See [prd.md](./prd.md) for full feature details.

---

## Product Vision

**One-liner**: 연구자/창작자를 위한 AI 노트 IDE (Cursor + Obsidian 스타일)

**Target Users**:
- 대학원생, 연구자
- 작가, 콘텐츠 기획자
- 지식 노동자

**Key Scenarios**:
1. 논문 초안/발표 준비
2. 연구 노트/아이디어 기록
3. 글쓰기/콘텐츠 기획

---

## Milestone 1: MVP (Sellable Alpha)

> **Goal**: 월 과금 가능한 최소 조합

### Core Editor ✅
- [x] TipTap WYSIWYG + Raw toggle
- [x] File create/delete/rename (context menu)
- [x] Folder create (context menu)
- [x] Vault 선택 + 최근 vault 기억
- [x] Quick Open (Cmd+P)
- [x] Tabs
- [x] `[[link]]` + 노트 간 이동
- [x] File watcher (실시간 변경 감지)
- [x] Obsidian-style heading input (### → h3)

### AI Features ✅
- [x] Chat UI (streaming)
- [x] Settings Panel (모델 선택)
- [x] **Managed API**: GPT-5-mini (서비스 제공 API 키)
- [x] **Context 전송**: 현재 파일 전체 / 선택 영역
- [x] **AI Quick Actions**: 요약, 다듬기, 번역, TODO 추출
- [x] **Backlinks Panel**: 현재 노트를 참조하는 노트 표시

**Supported Models (Dec 2025):**

| Model | Description |
|-------|-------------|
| GPT-5-mini | Fast and efficient (default) |
| GPT-5 | Most capable model |
| GPT-4.1 | Previous generation |
| GPT-4o | Multimodal model |

### Licensing (Planned)
- [ ] 이메일/계좌이체 기반 수동 발급
- [ ] 앱에서 라이선스 입력/검증

### Deferred to v1.1+
- Multi-agent system
- Folder 요약 / RAG
- Plugin system
- Ontology extension

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
- [x] **Folder Operations**: Create folders via context menu
- [x] **Context Menu**: Right-click menu for file/folder operations
- [x] **File Watcher**: Real-time file change detection
- [x] **Keyboard Shortcuts**: Cmd+N (new), Cmd+O (open), Cmd+Shift+A (chat), Cmd+P (quick open), Cmd+W (close tab)

---

## Phase 3: AI Integration ✅

### 3.1 Cloud AI Providers (Managed API)

> **변경**: 사용자가 API 키를 입력할 필요 없이 서비스에서 직접 제공

- [x] **Settings Panel**: AI 설정 UI (모델 선택)
- [x] **Managed API**: 서비스 제공 API 키 사용 (`.env` 파일)
- [x] **OpenAI Adapter**: GPT-5, GPT-5-mini, GPT-4.1, GPT-4o ✅ 현재 지원
- [ ] **Anthropic Adapter**: Claude 3.5/4 Sonnet (v1.1+)
- [ ] **Google Adapter**: Gemini 2.0 (v1.1+)

### 3.2 Context Injection ✅

- [x] **Current File Mode**: Send active document to AI
- [x] **Selected Text Mode**: Send highlighted text only
- [x] **AI Actions**: 요약, 다듬기, 번역, TODO 추출

### 3.3 Multi-Agent System (v1.1+)

> Deferred - not required for MVP

- [ ] Agent Framework
- [ ] Orchestrator
- [ ] Council Mode UI

---

## Phase 4: Backend Architecture

### 4.1 Overview

백엔드 책임 (최소화 원칙):
1. **인증 (Auth)**: 사용자 로그인/회원가입
2. **구독/플랜 (Plan)**: FREE / PRO / RESEARCH_PRO
3. **토큰 사용량 (Usage)**: 월별 사용량 추적
4. **결제 정보 (Payment)**: 결제 기록
5. **LLM 프록시**: 모든 AI 호출 중계 + 사용량 기록

### 4.2 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    OObsidian App                        │
│            (User Action: Chat/Summarize)                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + JWT
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 Proxy API Gateway                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  1. Auth 확인 (JWT)                              │   │
│  │  2. Plan/Entitlement 확인                        │   │
│  │  3. 이번 달 사용량 확인                          │   │
│  │  4. 한도 초과 시 에러/업셀 메시지                │   │
│  │  5. LLM Provider에 요청                          │   │
│  │  6. usage_logs에 토큰 기록                       │   │
│  │  7. 응답 스트리밍/전달                           │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               LLM Provider APIs                         │
│           (OpenAI / Anthropic / Google)                 │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Database Schema (Minimal)

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

### 4.4 API Endpoints

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

## Phase 5: Rich Editor ✅

### 5.1 WYSIWYG Markdown

- [x] TipTap Integration: ProseMirror-based editor
- [x] Live Rendering: Markdown syntax transforms in-place
- [x] Syntax Highlighting: Code blocks with lowlight
- [x] Rich/Raw Toggle: Switch between WYSIWYG and raw markdown
- [x] Typography Extension: Smart quotes, dashes
- [x] Dynamic Placeholders: Different placeholders for headings, paragraphs
- [x] Obsidian-style Headings: ### preview → h3 on Enter
- [ ] Tables: Visual table editor
- [ ] Callouts: Obsidian-style callout blocks
- [ ] Math Blocks: KaTeX rendering

### 5.2 Editor Features (Planned)

- [ ] Slash Commands: `/` menu for quick block insertion
- [ ] Link Preview: Hover to preview linked notes
- [ ] Image Support: Drag & drop, paste from clipboard

---

## Phase 5.5: PDF & Templates (v0.4)

### 5.5.1 PDF Integration

- [ ] PDF Text Extraction: Basic text extraction from PDF files
- [ ] PDF → Markdown: Convert PDF to .md file
- [ ] OCR Support (Local): Tesseract.js for image-based PDFs
- [ ] OCR Support (Cloud): Google Vision API (Pro tier)
- [ ] PDF Context Menu: Right-click PDF for extraction options

**PDF 우클릭 메뉴:**
```
┌─────────────────────────┐
│ 📄 Open PDF Viewer      │
│ 📝 Extract to Markdown  │
│ ✨ Summarize with AI    │ ← Pro
│ 🔍 Add to RAG Context   │ ← v1.1+
└─────────────────────────┘
```

### 5.5.2 Template System

- [ ] Template Picker: 새 노트 생성 시 템플릿 선택 UI 표시 (Notion 스타일)
- [ ] Built-in Templates: 5개 기본 템플릿 제공
- [ ] Slash Command: `/template` 입력으로 템플릿 삽입

**Template Picker UI (Cmd+N 시 표시):**
```
┌─────────────────────────────────────────────┐
│ Choose a Template                        ✕  │
├─────────────────────────────────────────────┤
│ 📄 Blank Note       빈 노트로 시작          │
│ 📑 Paper Notes      논문 읽기 노트          │
│ 📋 Meeting Notes    회의록                  │
│ 📅 Daily Note       오늘의 노트             │
│ 💡 Project Overview 프로젝트 개요           │
└─────────────────────────────────────────────┘
```

**Template Behavior:**
- Cmd+N / New File 버튼 → 템플릿 선택창 표시
- ESC 또는 "Blank Note" 선택 → 빈 노트 생성
- 에디터 내 `/template` → 템플릿 삽입

**Built-in Templates:**

| Template | 용도 | 주요 섹션 |
| ---------------- | ------------- | ------------------------------------------- |
| Blank Note | 기본 | (빈 노트) |
| Paper Notes | 논문 읽기 | Title, Authors, Abstract, Key Points, Notes |
| Meeting Notes | 회의록 | Date, Attendees, Agenda, Action Items |
| Daily Note | 일일 기록 | Date, Tasks, Notes, Reflections |
| Project Overview | 프로젝트 기획 | Objective, Timeline, Tasks, Resources |

**Custom Templates (v1.1+):**
- 사용자 정의 템플릿 저장
- 변수 지원: `{{date}}`, `{{title}}`, `{{author}}`
- 템플릿 폴더: `.templates/`

---

## Phase 6: AI File Operations (v1.1+)

> Deferred - not required for MVP

### 6.1 Basic Operations

- [ ] Create File: AI generates new documents from prompts
- [ ] Edit File: AI modifies existing content
- [ ] Rename File: Smart rename suggestions

### 6.2 Batch Operations

- [ ] Summarize Folder: Create summary of multiple files
- [ ] Bulk Rename: AI-powered file naming

---

## Phase 7: Core Productivity Features ✅

> Design Goal: Keep core app lightweight and fast.

### 7.1 Minimal Note-Taking Essentials

- [x] Internal Links: `[[note]]` syntax with navigation
- [x] Global Search: Cmd+P fuzzy file search
- [x] Tabs: Multiple open files with tab bar
- [x] Context Menu: File/folder create, delete, rename
- [x] Backlinks: Show notes linking to current note
- [ ] Tags (YAML frontmatter): `tags: [research, stats]`
- [ ] Daily Notes: Cmd+D for today's note

### 7.2 UI Polish

- [x] Settings Panel: User preferences modal with API key management
- [x] File Watcher: Auto-refresh on external changes
- [ ] Status Indicator: Plan/usage display
- [ ] Sort Options: Name, date modified, date created
- [ ] Persisted State: Last opened file, window position

---

## Phase 8: Licensing & Payments

### 8.1 Initial Manual Licensing (Korean Market)

- [ ] Manual Payment Option: Bank transfer support
- [ ] License Key Activation: Settings panel input
- [ ] Offline License Verification: Hash-based validation
- [ ] License Tiers: 1-year license or Lifetime option

### 8.2 Subscription Tiers

| Tier | Price | Features |
| ------------ | ------------ | ----------------------------------- |
| Free | $0 | BYOK only, single-agent |
| Pro | $12/mo | Managed API, multi-model |
| Research Pro | $20/mo | + Priority models, higher limits |

### 8.3 Future: Automated Licensing

- [ ] Stripe/Paddle Integration: Automated payments
- [ ] Auto-Updater: electron-updater integration
- [ ] Packaging: Build .app / .exe / .AppImage

---

## Phase 9: Plugin System (v1.1+)

> Deferred - not required for MVP

### 9.1 Plugin Architecture

- [ ] Plugin Loader
- [ ] Plugin API
- [ ] Plugin Settings

### 9.2 Official Plugins

- [ ] Tag Panel
- [ ] Daily Notes
- [ ] Graph View

---

## Technical Stack

| Component | Technology | Version |
| --------- | ---------------------- | ------- |
| Desktop | Electron | 39.x |
| Frontend | React | 19 |
| Language | TypeScript | 5.9 |
| Build | electron-vite | - |
| Styling | TailwindCSS | 4.x |
| Icons | Lucide React | - |
| Layout | react-resizable-panels | - |
| Editor | TipTap | 3.x |

---

## Architecture Diagrams

### App Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Electron Main Process                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  File I/O   │ │ AI Manager  │ │ Settings Store  │   │
│  │ handlers.ts │ │   (proxy)   │ │ electron-store  │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    Preload Script                       │
│                 (Context Bridge API)                    │
├─────────────────────────────────────────────────────────┤
│                  Renderer Process                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │   App.tsx   │ │ Components  │ │  Hooks/Utils    │   │
│  │  (Router)   │ │    (UI)     │ │    (Logic)      │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### AI Call Flow

```
┌─────────────────────────────────────────────────────────┐
│                      Client App                         │
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
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    Proxy Server                         │
│                - Auth + Plan check                      │
│                - Usage tracking                         │
│                - LLM routing                            │
└─────────────────────────────────────────────────────────┘
```

---

## Design Philosophy

- Dark-first UI: No light mode
- Minimal visual noise: Content-focused
- Obsidian/Cursor inspired: Familiar patterns
- Offline-first: Core features work without internet
- Lightweight core: Advanced features as plugins
- No lock-in: Plain markdown files
- Privacy-first: Local data, proxy doesn't store content

---

## Recent Changes (Dec 2025)

### File Explorer
1. Context menu (right-click) for file operations
2. New File / New Folder buttons in header
3. Inline rename input
4. Delete confirmation dialog
5. File watcher for real-time refresh
6. **Filter to md/pdf only**: 문서 파일만 표시

### Editor
1. TipTap WYSIWYG editor with Rich/Raw toggle
2. Obsidian-style heading input (### → h3 on Enter)
3. Syntax highlighting for code blocks
4. WikiLink extension for [[note]] links
5. Dynamic placeholders for headings
6. **Click anywhere to focus**: 에디터 영역 클릭 시 커서 활성화

### AI Features
1. **Context Injection**: 현재 파일/선택 영역을 AI에 전송
2. **Quick Actions**: 요약, 다듬기, 번역, TODO 추출
3. **Backlinks Panel**: 현재 노트를 참조하는 노트 표시

### Core Features
1. Settings Panel with AI model selection (Managed API - 사용자 API 키 불필요)
2. Quick Open (Cmd+P) fuzzy file search
3. Tabs for multiple open files
4. Internal links `[[note]]` syntax support
5. File watcher for external change detection
6. **OpenAI Integration**: GPT-5-mini (default), GPT-5, GPT-4.1, GPT-4o 지원

### Code Quality
1. ESLint configuration fixes
2. TypeScript strict mode compliance
3. Path validation security
4. Zoom controls disabled for consistent UI

---

## Next Steps (Priority Order)

1. ~~**AI Provider Integration**: OpenAI API~~ ✅ 완료
2. ~~**Context Injection**: Current file / selection to AI~~ ✅ 완료
3. ~~**Backlinks Panel**: Show notes linking to current note~~ ✅ 완료
4. **Status Indicator**: Show plan/usage in UI
5. **Template Picker**: Cmd+N 시 템플릿 선택 UI (Notion 스타일)
6. **PDF Integration**: PDF → Markdown 변환, OCR
7. **License System**: Manual license key activation
8. **Additional AI Providers**: Anthropic Claude, Google Gemini
