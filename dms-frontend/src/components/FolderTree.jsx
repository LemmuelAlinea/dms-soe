import { useState } from "react";
import { Folder, ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react";
import api from "../services/api";

export default function FolderTree({
  folders,
  parentID = null,
  onSelectFolder,
  activeFolderID,
  refreshFolders
}) {
  const [openFolders, setOpenFolders] = useState({});
  const [editingFolderID, setEditingFolderID] = useState(null);
  const [newName, setNewName] = useState("");

  const toggleFolder = (id) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRename = async (folderID) => {
    try {
      await api.put(`/api/folders/${folderID}`, {
        folderName: newName
      });

      setEditingFolderID(null);
      setNewName("");
      refreshFolders();
    } catch (err) {
      alert(err.response?.data?.message || "Rename failed");
    }
  };

  const children = folders.filter(
    (f) => f.parentFolderID === parentID
  );

  return (
    <ul className="space-y-1 ml-2">
      {children.map((folder) => {
        const hasChildren = folders.some(
          (f) => f.parentFolderID === folder.folderID
        );

        return (
          <li key={folder.folderID}>
            <div
              className={`flex items-center justify-between px-2 py-1 rounded-lg transition ${
                activeFolderID === folder.folderID
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">

                {hasChildren && (
                  <button
                    onClick={() => toggleFolder(folder.folderID)}
                    className="text-gray-500"
                  >
                    {openFolders[folder.folderID]
                      ? <ChevronDown size={16} />
                      : <ChevronRight size={16} />}
                  </button>
                )}

                <Folder size={16} className="text-blue-600" />

                {editingFolderID === folder.folderID ? (
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                ) : (
                  <span
                    onClick={() => onSelectFolder(folder)}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {folder.folderName}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {editingFolderID === folder.folderID ? (
                  <>
                    <button
                      onClick={() => handleRename(folder.folderID)}
                      className="text-green-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFolderID(null)}
                      className="text-red-600 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingFolderID(folder.folderID);
                        setNewName(folder.folderName);
                      }}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={async () => {
                        if (!window.confirm("Delete folder?")) return;
                        try {
                          await api.delete(`/folders/${folder.folderID}`);
                          refreshFolders();
                        } catch (err) {
                          alert(err.response?.data?.message || "Delete failed");
                        }
                      }}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {openFolders[folder.folderID] && (
              <FolderTree
                folders={folders}
                parentID={folder.folderID}
                onSelectFolder={onSelectFolder}
                activeFolderID={activeFolderID}
                refreshFolders={refreshFolders}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}