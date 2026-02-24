import { useEffect, useState } from "react";
import api from "../../services/api";
import { Trash2, RotateCcw } from "lucide-react";

export default function RecycleBin() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDeleted();
  }, []);

  const fetchDeleted = async () => {
    try {
      const res = await api.get("/api/documents/deleted");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (docID) => {
    try {
      await api.put(`/api/documents/restore/${docID}`);
      fetchDeleted();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Restore failed");
    }
  };

  const handlePermanentDelete = async (docID) => {
    if (!window.confirm("Permanently delete this file?")) return;

    try {
      await api.delete(`/api/documents/permanent/${docID}`);
      fetchDeleted();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 min-h-[85vh]">
      <h1 className="text-2xl font-bold mb-6">Recycle Bin</h1>

      <div className="bg-white rounded-2xl shadow-md p-6">
        {documents.length === 0 ? (
          <p className="text-gray-500">Recycle bin is empty.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="p-3 text-left">File</th>
                <th className="p-3 text-left">Deleted At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((doc) => (
                <tr key={doc.documentID} className="border-b">
                  <td className="p-3">📄 {doc.fileName}</td>
                  <td className="p-3">
                    {new Date(doc.deletedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex justify-end gap-4">
                    <button
                      onClick={() => handleRestore(doc.documentID)}
                      className="text-green-600 hover:scale-110 transition"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      onClick={() => handlePermanentDelete(doc.documentID)}
                      className="text-red-600 hover:scale-110 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}