import type { TLStore } from "@tldraw/tldraw"
import type { FileType, FolderType } from "@/types"

const DB_NAME = "tldraw-app"
const DB_VERSION = 1

export class DrawingDB {
  private db: IDBDatabase | null = null

  async init() {
    if (this.db) return

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = request.result

        if (!db.objectStoreNames.contains("folders")) {
          db.createObjectStore("folders", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("files")) {
          const fileStore = db.createObjectStore("files", { keyPath: "id" })
          fileStore.createIndex("folderId", "folderId", { unique: false })
        }
      }
    })
  }

  // Folder operations
  async createFolder(folder: FolderType): Promise<FolderType> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["folders"], "readwrite")
      const store = transaction.objectStore("folders")
      const request = store.add(folder)

      request.onsuccess = () => resolve(folder)
      request.onerror = () => reject(request.error)
    })
  }

  async getFolders(): Promise<FolderType[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["folders"], "readonly")
      const store = transaction.objectStore("folders")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateFolder(folder: FolderType): Promise<FolderType> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["folders"], "readwrite")
      const store = transaction.objectStore("folders")
      const request = store.put(folder)

      request.onsuccess = () => resolve(folder)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFolder(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["folders", "files"], "readwrite")

      // Delete folder
      const folderStore = transaction.objectStore("folders")
      folderStore.delete(id)

      // Delete all files in folder
      const fileStore = transaction.objectStore("files")
      const index = fileStore.index("folderId")
      const request = index.openCursor(IDBKeyRange.only(id))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          fileStore.delete(cursor.primaryKey)
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // File operations
  async createFile(file: FileType): Promise<FileType> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")

      // Initialize empty tldraw store
      const emptyStore = {
        ...file,
        content: {} as TLStore, // Initialize with empty store
      }

      const request = store.add(emptyStore)

      request.onsuccess = () => resolve(emptyStore)
      request.onerror = () => reject(request.error)
    })
  }

  async getFiles(): Promise<FileType[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readonly")
      const store = transaction.objectStore("files")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateFile(file: FileType): Promise<FileType> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")
      const request = store.put(file)

      request.onsuccess = () => resolve(file)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFile(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["files"], "readwrite")
      const store = transaction.objectStore("files")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Export/Import
  async exportData(): Promise<{ folders: FolderType[]; files: FileType[] }> {
    const folders = await this.getFolders()
    const files = await this.getFiles()
    return { folders, files }
  }

  async importData(data: { folders: FolderType[]; files: FileType[] }): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["folders", "files"], "readwrite")

      // Clear existing data
      transaction.objectStore("folders").clear()
      transaction.objectStore("files").clear()

      // Add new data
      const folderStore = transaction.objectStore("folders")
      const fileStore = transaction.objectStore("files")

      data.folders.forEach((folder) => folderStore.add(folder))
      data.files.forEach((file) => fileStore.add(file))

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export const db = new DrawingDB()

