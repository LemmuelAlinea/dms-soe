import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Building2,
  Users,
  Shield,
  FileText,
  HardDrive
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/superadmin/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-gray-800">
        System Overview
      </h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        <StatCard
          icon={<Building2 size={18} />}
          label="Departments"
          value={data?.totalDepartments || 0}
        />

        <StatCard
          icon={<Shield size={18} />}
          label="Admins"
          value={data?.totalAdmins || 0}
        />

        <StatCard
          icon={<Users size={18} />}
          label="CoAdmins"
          value={data?.totalCoAdmins || 0}
        />

        <StatCard
          icon={<FileText size={18} />}
          label="Documents"
          value={data?.totalDocuments || 0}
        />

        <StatCard
          icon={<HardDrive size={18} />}
          label="System Storage (MB)"
          value={data?.totalStorageMB || 0}
        />

      </div>

      {/* TOP DEPARTMENTS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">

        <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-6">
          Top Departments by Storage Usage
        </h2>

        {data?.topDepartments?.length === 0 ? (
          <p className="text-gray-500 text-sm ">
            No department data available.
          </p>
        ) : (
          <div className="space-y-4">
            {data?.topDepartments?.map((dept, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-400 pb-3 "
              >
                <span className="font-medium text-gray-800">
                  {dept.departmentName}
                </span>

                <span className="text-sm text-gray-500">
                  {(dept.usedStorage / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}


/* REUSABLE STAT CARD */
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition duration-300">

      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-3">
        {icon}
        <span>{label}</span>
      </div>

      <div className="text-2xl font-semibold text-gray-800">
        {value}
      </div>

    </div>
  );
}