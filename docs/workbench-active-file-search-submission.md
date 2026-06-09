# Individual Feature Submission: Workbench Active File Search

Saul Ifshin  
SWE 265P  
Spring 2026

## 1. Design as Initially Produced

The initial design is included in this pull request at:

- `docs/workbench-active-file-search-design.md`

Design summary:

Workbench Active File Search adds a filename filter to the Active Files workbench view. When users have many loaded PDFs or generated outputs, they can search the currently active workbench files without opening the separate file manager. The design keeps file state in FileContext, keeps filtering logic in a small pure utility, and changes only the visible Active Files cards.

The design proposed:

- A local search input in `FileEditor.tsx`.
- A pure filtering helper for deterministic filename matching.
- A visible count showing how many active files match the filter.
- A warning count when currently selected files are hidden by the filter.
- No backend changes and no changes to file persistence.

## 2. Pull Request Link

Pull request:

- https://github.com/Stirling-Tools/Stirling-PDF/compare/main...saul1310:Stirling-PDF:feature/workbench-file-search?expand=1

The branch is intended to be pushed to the fork and opened as an individual pull request from `feature/workbench-file-search`.

## 3. Project Guidelines

Project guidelines used for this work:

- `CONTRIBUTING.md`
- https://github.com/Stirling-Tools/Stirling-PDF/blob/main/CONTRIBUTING.md
- `DeveloperGuide.md`
- https://github.com/Stirling-Tools/Stirling-PDF/blob/main/DeveloperGuide.md
- `AGENTS.md`
- https://github.com/Stirling-Tools/Stirling-PDF/blob/main/AGENTS.md
- `frontend/editor/DeveloperGuide.md`
- https://github.com/Stirling-Tools/Stirling-PDF/blob/main/frontend/editor/DeveloperGuide.md

Relevant conventions followed:

- Frontend imports use `@app/*`.
- File state remains owned by FileContext.
- Translation keys are added only to `frontend/editor/public/locales/en-GB/translation.toml`.
- The change is focused on the frontend Active Files workbench and does not add unnecessary backend code.

## 4. Implementation Reflection

The implementation mostly followed the original design. The main strength of the design was its narrow integration point: the Active Files view already owns the visual list of loaded files, so filtering there avoids touching backend processing, persistence, or FileContext internals.

The implementation preserved that design by adding search state locally in `FileEditor.tsx` and extracting matching/counting behavior into `fileEditorSearch.ts`. This kept the UI component simpler and made the core behavior testable without rendering the whole workbench.

The main design decision that required care was selection behavior. Automatically clearing hidden selections would reduce surprises in the visible grid, but it would also make a search field mutate global FileContext selection state. The implementation keeps selections intact and instead shows a count when selected files are hidden by the current filter. This is a better separation of concerns because search controls visibility while FileContext remains responsible for selection.

The implementation also kept the search limited to filenames. Searching tool history, metadata, or PDF contents could be useful later, but it would require broader data modeling and indexing. Filename filtering is smaller, deterministic, and directly useful for crowded workbench sessions.

## Validation

Validation performed:

- `npx tsc --noEmit --project editor/src/core/tsconfig.json`
- Focused ESLint on the changed TypeScript/TSX files.
- Focused Prettier check on the changed TypeScript/TS/CSS files.

Validation limitations:

- `task frontend:check` could not run because `task` is not installed in this environment.
- The focused Vitest command reaches the repository's local `ERR_REQUIRE_ESM` startup issue while loading `frontend/editor/vitest.config.ts`. The new pure utility test is included for CI or a local environment where the configured Vitest runner starts correctly.

