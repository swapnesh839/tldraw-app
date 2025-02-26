"use client"

import { useEffect, useState } from "react"
import { Tldraw, type TLStore, type Editor } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"

import type { FileType, FolderType, SortOrder, SortDirection } from "@/types"
import { db } from "@/lib/db"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

function TldrawEditor({
  fileId,
  initialContent,
  onSave,
}: {
  fileId: string
  initialContent: TLStore
  onSave: (store: TLStore) => void
}) {
  const { toast } = useToast()

  const handleMount = (editor: Editor) => {
    editor.updateInstanceState({
      isDebugMode: false,
      exportBackground: true,
    })
  }

  const handleError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to save changes. Please try again.",
    })
    console.error("Tldraw error:", error)
  }

  return (
    <div className="h-full w-full">
      <Tldraw
        persistenceKey={fileId}
        store={initialContent}
        onMount={handleMount}
        onChange={onSave}
        onError={handleError}
      />
    </div>
  )
}

export default function DrawingApp() {
  const [activeFile, setActiveFile] = useState<FileType | null>(null)
  const [files, setFiles] = useState<FileType[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<SortOrder>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const files = await db.getFiles()
      const folders = await db.getFolders()
      setFiles(files)
      setFolders(folders)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
      })
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (file: FileType) => {
    setActiveFile(file)
  }

  const handleSave = async (store: TLStore) => {
    if (!activeFile) return

    const updatedFile = {
      ...activeFile,
      content: store,
      updatedAt: Date.now(),
    }

    try {
      await db.updateFile(updatedFile)
      setFiles(files.map((f) => (f.id === updatedFile.id ? updatedFile : f)))
      setActiveFile(updatedFile)
      toast({
        title: "Changes saved",
        description: "Your drawing has been saved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes. Please try again.",
      })
      console.error("Failed to save:", error)
    }
  }

  const sortFiles = (files: FileType[]) => {
    return [...files].sort((a, b) => {
      if (sortOrder === "name") {
        const comparison = a.name.localeCompare(b.name)
        return sortDirection === "asc" ? comparison : -comparison
      } else {
        const comparison = b.updatedAt - a.updatedAt
        return sortDirection === "asc" ? -comparison : comparison
      }
    })
  }

  const sortedFiles = sortFiles(files)

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-background">
        <AppSidebar
          files={sortedFiles}
          folders={folders}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onDataChange={loadData}
          isLoading={isLoading}
          sortOrder={sortOrder}
          sortDirection={sortDirection}
          onSortChange={(order, direction) => {
            setSortOrder(order)
            setSortDirection(direction)
          }}
        />
        <SidebarInset className="relative">
          {activeFile ? (
            <TldrawEditor
              key={activeFile.id}
              fileId={activeFile.id}
              initialContent={activeFile.content}
              onSave={handleSave}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="max-w-md text-center">
                <h3 className="mb-2 text-lg font-medium">No File Selected</h3>
                <p>Select an existing file from the sidebar or create a new one to start drawing.</p>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

