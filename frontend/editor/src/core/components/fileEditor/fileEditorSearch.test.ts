import { describe, expect, test } from "vitest";
import {
  countSelectedFilesOutsideFilter,
  filterFileEditorFiles,
  normalizeFileEditorSearchTerm,
} from "@app/components/fileEditor/fileEditorSearch";
import type { FileId, StirlingFileStub } from "@app/types/fileContext";

const buildFileStub = (
  id: string,
  name: string,
  overrides: Partial<StirlingFileStub> = {},
): StirlingFileStub => ({
  id: id as FileId,
  name,
  type: "application/pdf",
  size: 1024,
  lastModified: 0,
  isLeaf: true,
  originalFileId: id,
  versionNumber: 1,
  ...overrides,
});

describe("fileEditorSearch", () => {
  test("normalizes whitespace and case", () => {
    expect(normalizeFileEditorSearchTerm("  Invoice Q2  ")).toBe("invoice q2");
  });

  test("returns all files for an empty search", () => {
    const files = [
      buildFileStub("file-1", "invoice.pdf"),
      buildFileStub("file-2", "statement.pdf"),
    ];

    expect(filterFileEditorFiles(files, "  ")).toEqual(files);
  });

  test("filters files by filename case-insensitively", () => {
    const files = [
      buildFileStub("file-1", "Invoice-Q1.pdf"),
      buildFileStub("file-2", "notes.txt"),
      buildFileStub("file-3", "invoice-q2.pdf"),
    ];

    expect(
      filterFileEditorFiles(files, "INVOICE").map((file) => file.id),
    ).toEqual(["file-1", "file-3"]);
  });

  test("counts active selections hidden by the current filter", () => {
    const files = [
      buildFileStub("file-1", "invoice.pdf"),
      buildFileStub("file-2", "statement.pdf"),
      buildFileStub("file-3", "notes.pdf"),
    ];
    const visibleFiles = filterFileEditorFiles(files, "invoice");

    expect(
      countSelectedFilesOutsideFilter(
        ["file-1", "file-2", "missing-file"].map((id) => id as FileId),
        visibleFiles,
        files,
      ),
    ).toBe(1);
  });
});
