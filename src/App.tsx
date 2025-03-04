import { Tldraw, getSnapshot, TLEditorSnapshot, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useState, useRef } from "react";

export default function App() {
  const [content, setContent] = useState<TLEditorSnapshot | null>(null);
  // const [folderId, setFolderId] = useState("folder:1");
  // const [pageId, setPageId] = useState("page:1");
  const editorRef = useRef<Editor | null>(null); 

  useEffect(() => {
    if (content?.session?.currentPageId) {
      console.log("Current Page:", content.session.currentPageId);
    }
  }, [content]);



  return (
    <div className="h-screen flex-1 relative top-0 left-0 p-3 pb-12">
        <Tldraw
          onMount={(editor) => {
            editorRef.current = editor; 
            const handleChange = () => {
              const snapshot = getSnapshot(editor.store);
              setContent(snapshot);
            };

            editor.on("update", handleChange);

            return () => {
              editor.off("update", handleChange);
              editorRef.current = null; 
            };
          }}
        />
    </div>
  );
}
