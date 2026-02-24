import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Activity,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLogs() {
  const [logs, setLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentID: "",
    role: "",
    actionType: "",
    startDate: "",
    endDate: ""
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch departments
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDepartments();
  }, []);

  // Fetch logs when filters or page change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchLogs();
  }, [filters, page]);

  // Auto refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, filters, page]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/api/superadmin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const query = new URLSearchParams({
        ...filters,
        page,
        limit: 15
      }).toString();

      const res = await api.get(`/api/superadmin/logs?${query}`);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // EXPORT TO CSV
  // -----------------------
  const exportToCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      "User",
      "Role",
      "Department",
      "Action",
      "Description",
      "Date"
    ];

    const rows = logs.map(log => [
      log.fullName,
      log.role,
      log.departmentName || "",
      log.actionType,
      log.description,
      new Date(log.createdAt).toLocaleString()
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "global_logs.csv");
    document.body.appendChild(link);
    link.click();
  };

  const badgeColor = (action) => {
    switch (action) {
      case "UPLOAD":
        return "bg-blue-100 text-blue-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      case "RESTORE":
        return "bg-green-100 text-green-700";
      case "VERSION_UPLOAD":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Activity size={20} />
          Global Activity Logs
        </h1>

        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm hover:bg-[#1E293B] transition"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              autoRefresh
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {autoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <motion.div
        layout
        className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
          <Filter size={16} />
          Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          <select
            value={filters.departmentID}
            onChange={(e) =>
              setFilters({ ...filters, departmentID: e.target.value })
            }
            className="border p-3 rounded-lg text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.departmentID} value={dept.departmentID}>
                {dept.departmentName}
              </option>
            ))}
          </select>

          <select
            value={filters.role}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value })
            }
            className="border p-3 rounded-lg text-sm"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="CoAdmin">CoAdmin</option>
          </select>

          <select
            value={filters.actionType}
            onChange={(e) =>
              setFilters({ ...filters, actionType: e.target.value })
            }
            className="border p-3 rounded-lg text-sm"
          >
            <option value="">All Actions</option>
            <option value="UPLOAD">Upload</option>
            <option value="DELETE">Delete</option>
            <option value="RESTORE">Restore</option>
            <option value="VERSION_UPLOAD">Version Upload</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border p-3 rounded-lg text-sm"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border p-3 rounded-lg text-sm"
          />

        </div>
      </motion.div>

      {/* TABLE WITH ANIMATION */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

        {logs.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">
            No logs found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Action</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.tr
                    key={log.logID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">{log.fullName}</td>
                    <td className="p-4">{log.role}</td>
                    <td className="p-4">{log.departmentName || "—"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${badgeColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-4">{log.description}</td>
                    <td className="p-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm">

        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <span>
          Page {pagination.page || 1} of {pagination.totalPages || 1}
        </span>

        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage(page + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded bg-gray-200 disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>

      </div>

    </div>
  );
}