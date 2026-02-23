import { useEffect, useState } from "react";
import api from "../../services/api";
import DocumentTable from "../../components/DocumentTable";
import VersionModal from "../../components/VersionModal";
import FolderTree from "../../components/FolderTree";

export default function FolderExplorer() {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedVersionDoc, setSelectedVersionDoc] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await api.get("/folders");
      setFolders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async (folderID) => {
    try {
      const res = await api.get("/documents");
      const filtered = res.data.filter(
        (doc) => doc.folderID === folderID
      );
      setDocuments(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    fetchDocuments(folder.folderID);
  };

  const handleCreateFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        alert("Folder name required");
        return;
      }

      await api.post("/folders", {
        folderName: newFolderName,
        parentFolderID: selectedFolder
          ? selectedFolder.folderID
          : null,
      });

      setNewFolderName("");
      fetchFolders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create folder");
    }
  };

  const handleUpload = async () => {
    try {
      if (!file || !selectedFolder) {
        alert("Select file and folder first");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderID", selectedFolder.folderID);

      const res = await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message);
      setFile(null);
      fetchDocuments(selectedFolder.folderID);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  const handleDelete = async (docID) => {
    try {
      await api.delete(`/documents/${docID}`);
      fetchDocuments(selectedFolder.folderID);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreview = async (docID) => {
    try {
      const res = await api.get(`/documents/preview/${docID}`, {
        responseType: "blob",
      });

      const fileBlob = new Blob([res.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL);
    } catch (err) {
      console.error(err);
    }
  };

  const buildBreadcrumb = () => {
    if (!selectedFolder) return [];

    const path = [];
    let current = selectedFolder;

    while (current) {
      path.unshift(current);
      current = folders.find(
        (f) => f.folderID === current.parentFolderID
      );
    }

    return path;
  };

  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="min-h-[85vh] p-6">

        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-6">
          Document Management
        </h1>

        <div className="flex gap-6">

          {/* Folder Panel */}
          <div className="w-1/3 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Folders
            </h2>

            {/* Create Folder */}
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder={
                  selectedFolder
                    ? `Create inside ${selectedFolder.folderName}`
                    : "Create root folder"
                }
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(e.target.value)
                }
                className="w-full border p-2 rounded-lg text-sm"
              />

              <button
                onClick={handleCreateFolder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
              >
                Create Folder
              </button>
            </div>

            {/* Folder Tree */}
            <FolderTree
              folders={folders}
              onSelectFolder={handleFolderClick}
              activeFolderID={selectedFolder?.folderID}
              refreshFolders={fetchFolders}
            />
          </div>

          {/* Document Panel */}
          <div className="flex-1 bg-white rounded-2xl shadow-md p-6">

            {/* Breadcrumb */}
            <div className="mb-4">
              {selectedFolder ? (
                <div className="text-sm text-gray-500 flex flex-wrap gap-2 items-center">
                  <span className="font-medium">
                    Dashboard
                  </span>

                  {buildBreadcrumb().map((folder) => (
                    <span
                      key={folder.folderID}
                      className="flex items-center gap-2"
                    >
                      <span>&gt;</span>
                      <span
                        onClick={() =>
                          handleFolderClick(folder)
                        }
                        className="cursor-pointer hover:underline text-blue-600"
                      >
                        {folder.folderName}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Select a folder to view documents
                </p>
              )}
            </div>

            {/* Upload & Search */}
            {selectedFolder && (
              <div className="mb-6 flex gap-4 items-center">
                <input
                  type="file"
                  onChange={(e) =>
                    setFile(e.target.files[0])
                  }
                  className="text-sm"
                />

                <button
                  onClick={handleUpload}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  Upload
                </button>

                <input
                  type="text"
                  placeholder="Search file..."
                  className="border p-2 rounded-lg text-sm flex-1"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>
            )}

            {/* Documents Table */}
            <DocumentTable
              documents={filteredDocs}
              onPreview={handlePreview}
              onDelete={handleDelete}
              onVersions={(id) => {
                setSelectedVersionDoc(id);
                setShowVersionModal(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Version Modal */}
      {showVersionModal && (
        <VersionModal
          documentID={selectedVersionDoc}
          onClose={() =>
            setShowVersionModal(false)
          }
          onRestoreSuccess={() => {
            if (selectedFolder) {
              fetchDocuments(
                selectedFolder.folderID
              );
            }
          }}
        />
      )}
    </>
  );
}