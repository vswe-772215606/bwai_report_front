# Frontend Technical Context

## Purpose

This frontend is a finance operations review console for preparing reports from messy Excel workbooks.

The primary backend-supported workflow is:

1. upload workbook
2. build workbook index
3. create or upload blueprint
4. review blueprint fields
5. run extraction
6. review extraction candidates
7. select the best candidate per field

The UI must stay synchronized with the backend contracts that exist today.
Do not invent unsupported flows.

## Product Boundaries

The app is:

- a workbook ingestion and review workflow
- a blueprint-driven extraction workflow
- a candidate evidence review console
- a finance reporting preparation tool

The app is not:

- a generic BI dashboard
- a spreadsheet editor
- an accounting ledger
- an AI chat product
- a fully automated final report reconstruction tool

## Current Frontend Architecture

Tech stack:

- React 19
- TypeScript
- Vite 6
- React Router v7
- TanStack Query v5
- Axios
- Zustand
- Tailwind CSS
- Radix UI primitives

Main structure:

- `src/api`: backend resource clients
- `src/types`: frontend request/response models
- `src/pages`: route-level screens
- `src/components`: reusable UI and workflow components
- `src/store`: auth and workspace state

## Current Route Model

Primary workflow routes:

- `/dashboard`
- `/uploads`
- `/workbook-index`
- `/blueprints`
- `/blueprints/:id`
- `/extraction`

Legacy compatibility routes still exist:

- `/uploads/new`
- `/uploads/:id`
- `/table-review/:id`
- `/templates`
- `/templates/:id`
- `/mapping`
- `/validation`
- `/generate`
- `/reports`

The sidebar is intentionally primary-flow-first. Legacy pages remain reachable but are visually secondary.

## Global State

### Auth State

Stored in `src/store/authStore.ts`.

Fields:

- `token`
- `user`

Behavior:

- token is persisted in `localStorage`
- `AppLayout` loads `/auth/me` when authenticated
- 401 responses clear token and redirect to `/login`

### Workspace State

Stored in `src/store/workspaceStore.ts`.

Persisted fields:

- `currentUpload`
- `currentBlueprint`
- `currentIndexRun`
- `currentExtractionRun`

Behavior:

- selecting a new upload clears current index run and extraction run
- selecting a new blueprint clears current extraction run
- header displays the current workspace selection
- primary workflow pages use this state to reduce repetitive selection

## Backend Contract Handling

### API Client

`src/api/client.ts` contains:

- shared Axios instance
- bearer token injection
- 401 redirect handling
- centralized backend error normalization

### Error Normalization

The frontend supports these backend error shapes:

- `detail: string`
- `detail: object`
- `detail: validation array`
- fallback `message`
- fallback `error`

Normalized frontend error model:

- `message`
- `detail`
- `validationIssues`
- optional `status`

This is the only supported way pages should derive user-facing API error text.

## Current Backend Resource Coverage

### Auth

Routes used:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Frontend behavior:

- register creates the user
- login returns token only
- frontend then calls `/auth/me` to get user profile

### Uploads

Routes used:

- `POST /uploads/excel`
- `GET /uploads`
- `GET /uploads/{upload_id}`
- `GET /uploads/{upload_id}/sheets`
- `GET /uploads/{upload_id}/tables`
- `GET /uploads/{upload_id}/tables/{table_id}/preview`

Important contract facts:

- uploads are normalized from numeric ids to string ids
- upload label comes from `original_filename`
- upload detail does not assume embedded sheet data
- sheets are fetched from `/uploads/{upload_id}/sheets`
- table candidates are legacy support data, not the primary new workflow

### Blueprints

Routes used:

- `POST /blueprints`
- `POST /blueprints/upload-docx`
- `POST /blueprints/upload-pdf`
- `GET /blueprints`
- `GET /blueprints/{blueprint_id}`
- `GET /blueprints/{blueprint_id}/fields`
- `POST /blueprints/{blueprint_id}/fields`

Frontend assumptions intentionally kept minimal:

- `title` may also arrive as `name`
- `status`, `source_type`, and `parse_error` may be nullable
- field `data_type` defaults to `"string"` if absent
- `hints_json` is preserved as-is

Blueprint detail UI exposes manual field creation with these inputs:

- `section_key`
- `field_key`
- `label`
- `data_type`
- `required`
- `formula`
- `display_order`
- `hints_json`

### Workbook Index

Routes used:

- `POST /workbook-index/run`
- `GET /workbook-index/upload/{upload_id}/latest`
- `GET /workbook-index/{run_id}`
- `GET /workbook-index/{run_id}/sheets`

Frontend behavior:

- latest run lookup treats `404` as “no latest run yet”, not as a hard error
- indexed sheet sections are rendered structurally first
- raw JSON is only exposed in expandable debug panels

Indexed sheet UI tries to render:

- sheet name
- row count
- column count
- detected language
- summary JSON
- table summaries
- row label candidates
- column profiles

If any section is missing, UI shows `Not available yet`.

### Extraction

Routes used:

- `POST /extraction/run`
- `GET /extraction/{run_id}`
- `GET /extraction/{run_id}/candidates`
- `POST /extraction/candidates/{candidate_id}/select`

Frontend behavior:

- extraction run uses current upload and current blueprint
- latest workbook index can be attached automatically
- if auto-index is enabled but no latest index exists, UI prompts the user instead of faking a selection
- extraction candidates are grouped by blueprint field

Candidate review UI shows:

- candidate kind
- source sheet
- score
- rationale
- source reference
- evidence preview
- selected state

Visual distinctions:

- selected candidate
- low-confidence candidate
- formula-derived field
- field with no candidates

## Primary Page Responsibilities

### Dashboard

Purpose:

- explain the product as a review workflow
- show workspace progress
- show current selections
- drive users into the new primary routes

### Uploads

Purpose:

- upload Excel workbook
- list previous uploads
- show status, duplicate flag, created date
- set current upload in workspace state

### Workbook Index

Purpose:

- choose current upload
- run workbook index
- review latest run summary
- review indexed sheets in structured panels

### Blueprints

Purpose:

- create manual blueprint
- upload DOCX blueprint
- upload PDF blueprint
- list blueprints
- set current blueprint

### Blueprint Detail

Purpose:

- show blueprint metadata
- show parse error prominently
- review fields
- add fields manually

### Extraction Review

Purpose:

- choose upload and blueprint
- optionally use latest workbook index
- run extraction
- review extraction run summary
- review grouped candidates
- select candidate per field

## Legacy Flow Status

Legacy pages remain in the codebase and route tree for compatibility:

- templates
- mapping
- validation
- report generation
- legacy upload detail and table review

They are not the primary product narrative anymore.
New work should target the blueprint + workbook-index + extraction flow first unless the task is explicitly about legacy behavior.

## Known Backend Limitations the UI Must Respect

These constraints are intentional and must not be hidden with fake UX:

- PDF blueprint upload does not guarantee a fully parsed blueprint structure
- extraction produces candidate evidence, not final computed report values
- workbook index is a summary/index layer, not a spreadsheet editing surface
- legacy table preview/normalization exists, but it is not the primary architecture foundation
- missing backend fields must be rendered as unavailable, not invented

Correct UI language:

- `AI-assisted`
- `Blueprint`
- `Workbook index`
- `Extraction candidates`
- `Review required`

Do not claim:

- final AI-generated report
- fully automated report reconstruction
- complete PDF semantic parsing

## Implementation Rules for Future Changes

When changing the frontend:

- prefer backend route contracts over README text
- add new resource clients in `src/api`
- normalize numeric ids to strings at the API boundary
- keep backend-optional fields optional in frontend types
- show structured sections first, raw JSON second
- use workspace state for cross-screen selection
- use `extractErrorMessage` or `normalizeApiError` for failures
- if backend capability is incomplete, label it `Not available yet`

## Important Files

Core app shell:

- `src/App.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`

State:

- `src/store/authStore.ts`
- `src/store/workspaceStore.ts`

Primary API modules:

- `src/api/client.ts`
- `src/api/auth.ts`
- `src/api/uploads.ts`
- `src/api/blueprints.ts`
- `src/api/workbookIndex.ts`
- `src/api/extraction.ts`

Primary pages:

- `src/pages/DashboardPage.tsx`
- `src/pages/UploadsListPage.tsx`
- `src/pages/WorkbookIndexPage.tsx`
- `src/pages/BlueprintsPage.tsx`
- `src/pages/BlueprintDetailPage.tsx`
- `src/pages/ExtractionReviewPage.tsx`

## Verification Baseline

Current baseline after the workflow realignment:

- route tree updated to primary new workflow
- workspace selection persisted
- primary backend resource clients implemented
- centralized API error normalization implemented
- typecheck passes with `npm.cmd run typecheck`

This file should be updated whenever:

- backend route contracts change
- new primary workflow resources are added
- workspace selection semantics change
- legacy routes are removed or promoted
