import { Eye, Trash2, GitBranch } from "lucide-react";

export default function DocumentTable({
  documents,
  onPreview,
  onDelete,
  onVersions
}) {
  const formatSize = (bytes) =>
    (bytes / (1024 * 1024)).toFixed(2) + " MB";

  const formatDate = (date) =>
    new Date(date).toLocaleDateString();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-3 text-left">File</th>
            <th className="p-3 text-left">Size</th>
            <th className="p-3 text-left">Uploaded</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.documentID}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-3 font-medium text-gray-700">
                📄 {doc.fileName}
              </td>
              <td className="p-3 text-gray-500">
                {formatSize(doc.fileSize)}
              </td>
              <td className="p-3 text-gray-500">
                {formatDate(doc.createdAt)}
              </td>
              <td className="p-3 flex justify-end gap-4">
                <button
                  onClick={() => onPreview(doc.documentID)}
                  className="text-blue-600 hover:scale-110 transition"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => onVersions(doc.documentID)}
                  className="text-purple-600 hover:scale-110 transition"
                >
                  <GitBranch size={16} />
                </button>

                <button
                  onClick={() => onDelete(doc.documentID)}
                  className="text-red-600 hover:scale-110 transition"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}