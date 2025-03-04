interface File {
  name: string;
}

interface Folder {
  name: string;
  files: File[];
  open: boolean;
}
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "./ui/sidebar";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";



export function AppSidebar() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileNames, setNewFileNames] = useState<{ [key: number]: string }>(
    {}
  );

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders([...folders, { name: newFolderName, files: [], open: true }]);
    setNewFolderName("");
  };

  const addFile = (folderIndex: number) => {
    if (!newFileNames[folderIndex]?.trim()) return;
    setFolders((prevFolders) => {
      const updatedFolders = [...prevFolders];
      updatedFolders[folderIndex].files.push({
        name: newFileNames[folderIndex],
      });
      return updatedFolders;
    });
    setNewFileNames((prev) => ({ ...prev, [folderIndex]: "" }));
  };

  const deleteFolder = (index: number) => {
    setFolders(folders.filter((_, i) => i !== index));
  };

  const deleteFile = (folderIndex: number, fileIndex: number) => {
    setFolders((prevFolders) => {
      const updatedFolders = [...prevFolders];
      updatedFolders[folderIndex].files.splice(fileIndex, 1);
      return updatedFolders;
    });
  };

  const toggleFolder = (index: number) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder, i) =>
        i === index ? { ...folder, open: !folder.open } : folder
      )
    );
  };
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="w-64 h-screen p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Folders</h2>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                  />
                  <Button onClick={addFolder} variant="ghost">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div>
                {folders.map((folder, index) => (
                  <div key={index} className="mb-2">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleFolder(index)}
                    >
                      {folder.open ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Folder className="w-5 h-5 mx-2" />
                      <span className="flex-1">{folder.name}</span>
                      <Button
                        onClick={() => deleteFolder(index)}
                        variant="ghost"
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    {folder.open && (
                      <div className="ml-6 mt-2">
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newFileNames[index] || ""}
                            onChange={(e) =>
                              setNewFileNames((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }))
                            }
                            placeholder="File name"
                          />
                          <Button
                            onClick={() => addFile(index)}
                            variant="ghost"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {folder.files.length === 0 ? (
                          <p className="text-gray-400 text-sm">No files</p>
                        ) : (
                          folder.files.map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="flex items-center text-sm mt-1"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              <span className="flex-1">{file.name}</span>
                              <Button
                                onClick={() => deleteFile(index, fileIndex)}
                                variant="ghost"
                                size="icon"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu> */}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
