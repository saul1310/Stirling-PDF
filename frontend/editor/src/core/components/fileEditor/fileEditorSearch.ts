import type { FileId, StirlingFileStub } from "@app/types/fileContext";

export function normalizeFileEditorSearchTerm(searchTerm: string): string {
  return searchTerm.trim().toLowerCase();
}

export function filterFileEditorFiles(
  files: readonly StirlingFileStub[],
  searchTerm: string,
): StirlingFileStub[] {
  const normalizedSearchTerm = normalizeFileEditorSearchTerm(searchTerm);

  if (!normalizedSearchTerm) {
    return [...files];
  }

  return files.filter((file) =>
    file.name.toLowerCase().includes(normalizedSearchTerm),
  );
}

export function countSelectedFilesOutsideFilter(
  selectedFileIds: readonly FileId[],
  visibleFiles: readonly StirlingFileStub[],
  allFiles: readonly StirlingFileStub[],
): number {
  const visibleFileIds = new Set(visibleFiles.map((file) => file.id));
  const activeFileIds = new Set(allFiles.map((file) => file.id));

  return selectedFileIds.filter(
    (fileId) => activeFileIds.has(fileId) && !visibleFileIds.has(fileId),
  ).length;
}
