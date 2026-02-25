import { useEffect, useState } from "react";
import api from "../services/api";
import { X, RotateCcw, Upload } from "lucide-react";

export default function VersionModal({
  documentID,
  onClose,
  onRestoreSuccess,
}) {
  const [versions, setVersions] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
     
    fetchVersions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/api/documents/versions/${documentID}`);
      setVersions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadVersion = async () => {
    if (!file) return alert("Select file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.put(`/api/documents/version/${documentID}`, formData);
      setFile(null);
      fetchVersions();
      alert("New version uploaded");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleRestore = async (versionID) => {
    try {
      await api.put(`/api/documents/versions/restore/${versionID}`);
      fetchVersions();
      onRestoreSuccess();
      alert("Version restored");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Restore failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">

      <div className="bg-white w-[600px] rounded-2xl border border-gray-200 p-6 shadow-lg animate-slideUp">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Version History
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Upload New Version */}
        <div className="mb-6 flex gap-3 items-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm"
          />

          <button
            onClick={handleUploadVersion}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <Upload size={16} />
            Upload Version
          </button>
        </div>

        {/* Version List */}
        <div className="max-h-60 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No previous versions.
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.versionID}
                className="flex justify-between items-center border-b py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-700">
                    {version.filePath}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleRestore(version.versionID)
                  }
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                >
                  <RotateCcw size={14} />
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}