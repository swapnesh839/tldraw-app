import type { TLStore } from "@tldraw/tldraw"

export type FileType = {
  id: string
  name: string
  extension: ".tldr"
  folderId: string
  content: TLStore
  createdAt: number
  updatedAt: number
}

export type FolderType = {
  id: string
  name: string
  createdAt: number
}

export type SortOrder = "name" | "date"
export type SortDirection = "asc" | "desc"

