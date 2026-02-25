import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Trash2 } from "lucide-react";

export default function CoAdminRecycleBin() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDeleted();
  }, []);

  const fetchDeleted = async () => {
    try {
      const res = await api.get("/api/documents?deleted=true");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const permanentlyDelete = async (documentID) => {
    if (!window.confirm("Permanently delete this document?")) return;

    try {
      await api.delete(`/api/documents/permanent/${documentID}`);
      fetchDeleted();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold text-gray-800">
        Recycle Bin
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No deleted documents.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.documentID}
              className="flex justify-between items-center border-b pb-2"
            >
              <span>{doc.fileName}</span>

              <button
                onClick={() => permanentlyDelete(doc.documentID)}
                className="text-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Permanently Delete
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}