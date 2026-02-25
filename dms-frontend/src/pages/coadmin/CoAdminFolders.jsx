import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FolderPlus,
  Pencil,
  Trash2,
  Upload
} from "lucide-react";

export default function CoAdminFolders() {
  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolderID, setSelectedFolderID] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await api.get("/api/folders");
      setFolders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createFolder = async () => {
    if (!folderName) return;

    try {
      await api.post("/api/folders", { folderName });
      setFolderName("");
      fetchFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const renameFolder = async () => {
    try {
      await api.put(`/api/folders/${editingFolder.folderID}`, {
        folderName: editingFolder.folderName,
      });
      setEditingFolder(null);
      fetchFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFolder = async (folderID) => {
    if (!window.confirm("Delete this folder?")) return;

    try {
      await api.delete(`/api/folders/${folderID}`);
      fetchFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !selectedFolderID) {
      alert("Select file and folder first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folderID", selectedFolderID);

    try {
      await api.post("/api/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload successful");
      setSelectedFile(null);
      setSelectedFolderID("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-gray-800">
        Folder Explorer
      </h1>

      {/* CREATE FOLDER */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="flex-1 border p-3 rounded-lg"
          />
          <button
            onClick={createFolder}
            className="bg-[#0F172A] text-white px-6 rounded-lg flex items-center gap-2"
          >
            <FolderPlus size={16} />
            Create
          </button>
        </div>
      </div>

      {/* UPLOAD DOCUMENT */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h2 className="text-lg font-semibold">Upload Document</h2>

        <select
          value={selectedFolderID}
          onChange={(e) => setSelectedFolderID(e.target.value)}
          className="w-full border p-3 rounded-lg"
        >
          <option value="">Select Folder</option>
          {folders.map((folder) => (
            <option key={folder.folderID} value={folder.folderID}>
              {folder.folderName}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="w-full"
        />

        <button
          onClick={uploadDocument}
          className="bg-[#0F172A] text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      {/* FOLDER LIST */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        {folders.map((folder) => (
          <div
            key={folder.folderID}
            className="flex justify-between items-center border-b pb-2"
          >
            {editingFolder?.folderID === folder.folderID ? (
              <>
                <input
                  value={editingFolder.folderName}
                  onChange={(e) =>
                    setEditingFolder({
                      ...editingFolder,
                      folderName: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <button
                  onClick={renameFolder}
                  className="text-blue-600"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span>{folder.folderName}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingFolder(folder)}
                    className="text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => deleteFolder(folder.folderID)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}