import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CoAdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/logs");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Activity Logs
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {logs.map((log, index) => (
          <div key={index} className="border-b py-2 text-sm">
            {log.action} - {log.createdAt}
          </div>
        ))}
      </div>
    </div>
  );
}