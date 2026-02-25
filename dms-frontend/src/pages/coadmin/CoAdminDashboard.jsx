import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CoAdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/analytics/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">

      <div className="bg-white p-6 rounded-xl shadow">
        <p>Total Folders</p>
        <h2 className="text-2xl font-bold">{stats.totalFolders}</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <p>Total Documents</p>
        <h2 className="text-2xl font-bold">{stats.totalDocuments}</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <p>Storage Used</p>
        <h2 className="text-2xl font-bold">
          {stats.storageUsedMB} MB
        </h2>
      </div>

    </div>
  );
}