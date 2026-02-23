import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  HardDrive,
  Folder,
  FileText,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [storage, setStorage] = useState(null);
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storageRes = await api.get("/analytics/dashboard");
      const foldersRes = await api.get("/folders");
      const documentsRes = await api.get("/documents");
      const logsRes = await api.get("/logs");

      setStorage(storageRes.data);
      setFolders(foldersRes.data);
      setDocuments(documentsRes.data);
      setLogs(logsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const storagePercentage = storage
    ? (storage.usedStorageMB / storage.storageLimitMB) * 100
    : 0;

  const healthColor =
    storagePercentage > 80
      ? "bg-red-500"
      : storagePercentage > 60
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="space-y-10">

      {/* TOP ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white border border-gray-500 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">
          <div className="flex items-center gap-3 mb-4 text-gray-600">
            <HardDrive size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Used Storage
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800">
            {storage?.usedStorageMB || 0} MB
          </p>
        </div>

        <div className="bg-white border border-gray-500 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">
          <div className="flex items-center gap-3 mb-4 text-gray-600">
            <HardDrive size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Storage Limit
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800">
            {storage?.storageLimitMB || 0} MB
          </p>
        </div>

        <div className="bg-white border border-gray-500 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">
          <div className="flex items-center gap-3 mb-4 text-gray-600">
            <HardDrive size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Storage Health
            </span>
          </div>

          <div className="w-full bg-gray-400 rounded-full h-4">
            <div
              className={`${healthColor} h-4 rounded-full transition-all duration-500`}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-600">
            {storagePercentage.toFixed(1)}% used
          </p>
        </div>

      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-500 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">
          <div className="flex items-center gap-3 mb-4 text-gray-600">
            <Folder size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Total Folders
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800">
            {folders.length}
          </p>
        </div>

        <div className="bg-white border border-gray-500 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">
          <div className="flex items-center gap-3 mb-4 text-gray-600">
            <FileText size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Total Documents
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-800">
            {documents.length}
          </p>
        </div>

      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm ">
        <div className="flex items-center gap-3 mb-4 text-gray-600">
          <Activity size={18} />
          <span className="text-sm font-medium uppercase tracking-wide">
            Recent Activity
          </span>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No recent activity.
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.logID}
                className="text-sm text-gray-600 border-b border-gray-100 pb-2"
              >
                {log.description}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}