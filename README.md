# SQB Financial Report Builder — Frontend

A financial data standardization and reporting platform. Users upload messy Excel files, map columns to standardized fields with AI assistance, validate financial correctness, and generate PDF/DOCX reports.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- React Router v7
- TanStack Query v5
- Axios
- Tailwind CSS v3
- Radix UI (shadcn-compatible primitives)
- Zustand (auth/global state)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and set your backend URL:

```bash
cp .env.example .env.local
```

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Type check

```bash
npm run typecheck
```

## Project Structure

```
src/
  api/           # Axios API client modules (one per resource)
  components/
    layout/      # AppLayout, Sidebar, Header, ProtectedRoute
    mapping/     # MappingReviewTable, MappingConfidenceBadge, AggregationSelector
    reports/     # ReportList, ReportGenerateForm
    tables/      # TableCandidates, DataPreviewTable, HeaderRowSelector, SheetList
    templates/   # TemplateList, TemplateFieldTable, TemplateUploadBox
    upload/      # ExcelUploadBox, UploadList
    ui/          # Shared primitives (Button, Badge, Card, Select, Table, etc.)
    validation/  # ValidationSummary, ValidationIssueList
  hooks/         # useToast
  lib/           # cn() utility
  pages/         # One file per route
  store/         # authStore (Zustand + localStorage)
  types/         # Strict TypeScript interfaces for all domain objects
  utils/         # formatCurrency, formatDate, fileDownload
```

## Routes

| Path | Page |
|------|------|
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Overview + quick actions |
| `/uploads` | List all Excel uploads |
| `/uploads/new` | Upload a new Excel file |
| `/uploads/:id` | Upload detail, sheet list, table candidates |
| `/table-review/:id` | Confirm header row, normalize table, preview data |
| `/templates` | List and create templates |
| `/templates/:id` | Template detail + field table |
| `/mapping` | AI column mapping review and confirmation |
| `/validation` | Run validation, view issues |
| `/generate` | Generate PDF/DOCX report |
| `/reports` | Report history + download |

## Key Design Rules

- **AI is an assistant, not an authority.** AI mapping suggestions are never auto-confirmed. Users must confirm explicitly.
- **Validation errors block report generation.** The UI enforces this — the Generate button is disabled when blocking errors exist.
- **Confidence is always shown.** Mappings with confidence < 75% display a "Needs review" badge.
- **All API errors are surfaced clearly.** No silent failures.
- **Duplicate file uploads** show a warning linking to the original.
- **Duplicate column names** show column path/index to disambiguate.

## Backend API

Set `VITE_API_BASE_URL` to your backend's base URL. The API client (`src/api/client.ts`) automatically adds `Authorization: Bearer <token>` to all requests and redirects to `/login` on 401.

All endpoints are documented in `src/api/*.ts`.
