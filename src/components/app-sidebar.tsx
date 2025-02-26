"use client"

import * as React from "react"
import {
  ChevronRight,
  File,
  Folder,
  FolderPlus,
  Import,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { nanoid } from "nanoid"

import type { FileType, FolderType, SortOrder, SortDirection } from "@/types"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

// Declare TLStore type
type TLStore = any

interface AppSidebarProps {
  files: FileType[]
  folders: FolderType[]
  activeFile: FileType | null
  onFileSelect: (file: FileType) => void
  onDataChange: () => void
  isLoading: boolean
  sortOrder: SortOrder
  sortDirection: SortDirection
  onSortChange: (order: SortOrder, direction: SortDirection) => void
}

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  onRename: (newName: string) => Promise<void>
}

function RenameDialog({ open, onOpenChange, initialName, onRename }: RenameDialogProps) {
  const [name, setName] = React.useState(initialName)
  const { toast } = useToast()

  React.useEffect(() => {
    setName(initialName)
  }, [initialName])

  const handleRename = async () => {
    try {
      await onRename(name)
      onOpenChange(false)
      toast({
        title: "Renamed successfully",
        description: "The item has been renamed.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename. Please try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AppSidebar({
  files,
  folders,
  activeFile,
  onFileSelect,
  onDataChange,
  isLoading,
  sortOrder,
  sortDirection,
  onSortChange,
}: AppSidebarProps) {
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)
  const [newFileOpen, setNewFileOpen] = React.useState(false)
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null)
  const [newItemName, setNewItemName] = React.useState("")
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [itemToRename, setItemToRename] = React.useState<{ id: string; name: string; type: "file" | "folder" } | null>(
    null,
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFileName = (name: string): string => {
    if (!name.endsWith(".tldr")) {
      return `${name}.tldr`
    }
    return name
  }

  const handleCreateFolder = async () => {
    if (!newItemName) return

    try {
      const folder: FolderType = {
        id: nanoid(),
        name: newItemName,
        createdAt: Date.now(),
      }

      await db.createFolder(folder)
      setNewFolderOpen(false)
      setNewItemName("")
      onDataChange()
      toast({
        title: "Folder created",
        description: "New folder has been created successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create folder. Please try again.",
      })
    }
  }

  const handleCreateFile = async () => {
    if (!newItemName || !selectedFolder) return

    try {
      const file: FileType = {
        id: nanoid(),
        name: validateFileName(newItemName),
        extension: ".tldr",
        folderId: selectedFolder,
        content: {} as TLStore,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await db.createFile(file)
      setNewFileOpen(false)
      setNewItemName("")
      onDataChange()
      toast({
        title: "File created",
        description: "New drawing file has been created successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create file. Please try again.",
      })
    }
  }

  const handleRename = async (newName: string) => {
    if (!itemToRename) return

    try {
      if (itemToRename.type === "file") {
        const file = files.find((f) => f.id === itemToRename.id)
        if (!file) return

        const updatedFile = {
          ...file,
          name: validateFileName(newName),
        }
        await db.updateFile(updatedFile)
      } else {
        const folder = folders.find((f) => f.id === itemToRename.id)
        if (!folder) return

        const updatedFolder = {
          ...folder,
          name: newName,
        }
        await db.updateFolder(updatedFolder)
      }
      onDataChange()
    } catch (error) {
      throw error
    }
  }

  const handleDeleteFolder = async (id: string) => {
    try {
      await db.deleteFolder(id)
      onDataChange()
      toast({
        title: "Folder deleted",
        description: "The folder and its contents have been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete folder. Please try again.",
      })
    }
  }

  const handleDeleteFile = async (id: string) => {
    try {
      await db.deleteFile(id)
      onDataChange()
      toast({
        title: "File deleted",
        description: "The drawing file has been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete file. Please try again.",
      })
    }
  }

  const handleExport = async () => {
    try {
      const data = await db.exportData()
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "tldraw-backup.json"
      a.click()
      URL.revokeObjectURL(url)
      toast({
        title: "Export successful",
        description: "Your drawings have been exported successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export data. Please try again.",
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await db.importData(data)
      onDataChange()
      toast({
        title: "Import successful",
        description: "Your drawings have been imported successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import data. Please ensure the file is valid.",
      })
    }
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">TLDraw App</h2>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortOrder}
                    onValueChange={(value) => onSortChange(value as SortOrder, sortDirection)}
                  >
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sortDirection}
                    onValueChange={(value) => onSortChange(sortOrder, value as SortDirection)}
                  >
                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeSwitcher />
            </div>
          </div>
          <div className="px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setNewFolderOpen(true)}
              disabled={isLoading}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-1/2 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-2/3 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <SidebarGroupContent>
                {folders.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No folders yet. Create one to get started.
                  </div>
                ) : (
                  folders.map((folder) => {
                    const folderFiles = files.filter((file) => file.folderId === folder.id)
                    return (
                      <Collapsible key={folder.id} defaultOpen>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton>
                                <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                <Folder className="h-4 w-4 shrink-0" />
                                <span>{folder.name}</span>
                                {folderFiles.length > 0 && (
                                  <Badge variant="secondary" className="ml-auto">
                                    {folderFiles.length}
                                  </Badge>
                                )}
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFolder(folder.id)
                                    setNewFileOpen(true)
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  New File
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setItemToRename({ id: folder.id, name: folder.name, type: "folder" })
                                    setRenameOpen(true)
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteFolder(folder.id)}
                                >
                                  Delete Folder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <CollapsibleContent>
                              <SidebarMenu className="mt-1 pl-6">
                                {folderFiles.map((file) => (
                                  <SidebarMenuItem key={file.id}>
                                    <SidebarMenuButton
                                      onClick={() => onFileSelect(file)}
                                      isActive={activeFile?.id === file.id}
                                    >
                                      <File className="h-4 w-4 shrink-0" />
                                      <span>{file.name}</span>
                                    </SidebarMenuButton>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setItemToRename({ id: file.id, name: file.name, type: "file" })
                                            setRenameOpen(true)
                                          }}
                                        >
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => handleDeleteFile(file.id)}
                                        >
                                          Delete File
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </SidebarMenuItem>
                                ))}
                              </SidebarMenu>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </Collapsible>
                    )
                  })
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleExport} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Import className="mr-2 h-4 w-4" />
              Import
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input placeholder="Folder name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newFileOpen} onOpenChange={setNewFileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Drawing</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="File name (will add .tldr extension)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {itemToRename && (
        <RenameDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          initialName={itemToRename.name}
          onRename={handleRename}
        />
      )}
    </>
  )
}

