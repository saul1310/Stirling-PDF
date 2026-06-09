# Workbench Active File Search Design

Saul Ifshin  
SWE 265P  
Spring 2026

## Brief Description

Workbench Active File Search adds a filename filter to the Active Files workbench view. When a user has many PDFs or generated outputs loaded, they can search the currently active workbench files without opening the separate file manager or changing the underlying FileContext state.

The feature aims to make large multi-file workflows easier to navigate by letting users quickly find, view, reorder, download, close, or select a loaded file by name.

## Motivation

Stirling PDF supports stateful multi-tool workflows where users can keep many input and output files active while moving between tools. That is useful, but the Active Files workbench can become crowded after operations such as split, merge, convert, or repeated tool chaining.

This feature is valuable because it:

- Helps users locate a specific loaded file without scrolling through every active card.
- Improves usability for workflows that create many intermediate PDFs.
- Keeps the feature local to the workbench instead of changing file persistence or storage behavior.
- Preserves existing selection and file ownership behavior in FileContext.

## Relevant Current System Details

### FileContext

`frontend/editor/src/core/contexts/FileContext.tsx` owns active file state, selection state, persistence, and file lifecycle cleanup. Active file UI should read from FileContext and call its actions, not maintain a separate source of truth for files.

### FileEditor

`frontend/editor/src/core/components/fileEditor/FileEditor.tsx` renders the Active Files workbench. It reads active file stubs from FileContext selectors, renders an `AddFileCard`, and maps active stubs to `FileEditorThumbnail` cards. It also handles upload, close, download, view, unzip, and reorder actions.

### FileEditorThumbnail

`frontend/editor/src/core/components/fileEditor/FileEditorThumbnail.tsx` renders each active file card and owns card-level behavior such as hover actions, double-click-to-view, drag/drop reorder, pinning, download, share, upload, close, and unzip actions.

### Translations and Styling

Frontend strings are stored in `frontend/editor/public/locales/en-GB/translation.toml`. File editor styling uses `frontend/editor/src/core/components/fileEditor/FileEditor.module.css`.

## Detailed Design

### User Experience

When the Active Files workbench contains at least one file, the top of the workbench shows:

- A search input labelled "Search active files".
- A clear button when a search term is active.
- A summary showing how many loaded files are visible.
- A note when selected files are hidden by the current filter.

Typing in the search input filters visible file cards by filename. Clearing the search restores the full active file grid.

If the search has no matches, the workbench displays an empty state explaining that no active files match and that clearing the search will show all loaded files.

### Implementation Changes

The implementation adds a small pure utility module:

- `frontend/editor/src/core/components/fileEditor/fileEditorSearch.ts`

This module owns deterministic search behavior:

- `normalizeFileEditorSearchTerm` trims and lowercases the user search term.
- `filterFileEditorFiles` returns active file stubs whose names include the search term.
- `countSelectedFilesOutsideFilter` counts selected active files that are currently hidden by the filter.

`FileEditor.tsx` adds local UI state for the search term and derives filtered stubs with `useMemo`. The filter does not write to FileContext, does not remove files, and does not clear selections. This keeps FileContext as the owner of active file and selection state.

`FileEditor.module.css` adds layout styles for the search bar, summary text, empty state, and the extracted file grid layout.

`translation.toml` adds `fileEditor.*` translation keys for the new UI text.

`fileEditorSearch.test.ts` tests the pure filtering and hidden-selection counting behavior.

### Design Principles

- Separation of concerns: filtering logic is isolated in a pure utility; UI state stays in `FileEditor`; file state remains in FileContext.
- Minimal surface area: the feature does not change backend behavior, file persistence, thumbnail generation, or file lifecycle cleanup.
- Predictable state: searching changes only what is visible, not which files are loaded or selected.
- Accessibility: the search input and clear button have translated accessible labels.

## Limitations

- Search matches filenames only; it does not search file metadata, tool history, tags, or page contents.
- Filtering does not change active selections. If selected files are hidden, the UI reports the count but leaves the selection intact.
- The search term is in-memory UI state and resets when the file editor unmounts.
- The feature is scoped to the Active Files workbench, not the full My Files page or recent-file modal.

## Appendix: Intermediate Artifacts

### A. Repository Notes

Files reviewed before implementation:

- `frontend/editor/src/core/components/fileEditor/FileEditor.tsx`
- `frontend/editor/src/core/components/fileEditor/FileEditorThumbnail.tsx`
- `frontend/editor/src/core/components/fileEditor/FileEditor.module.css`
- `frontend/editor/src/core/contexts/FileContext.tsx`
- `frontend/editor/src/core/contexts/file/fileHooks.ts`
- `frontend/editor/public/locales/en-GB/translation.toml`

### B. Alternatives Considered

- Full metadata search across stored files: rejected because it belongs in the file manager or My Files page, not the workbench.
- Clearing hidden selections automatically: rejected because it would make search mutate FileContext selection state unexpectedly.
- Adding search to the global workbench bar: rejected because the filter only applies to Active Files cards, so local placement is clearer.
- Searching PDF contents: rejected because it would require document indexing and is outside the scope of a focused UI feature.

