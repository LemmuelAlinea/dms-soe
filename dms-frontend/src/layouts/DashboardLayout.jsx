import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  LayoutDashboard,
  Folder,
  Trash2,
  Activity,
  Users,
  LogOut,
  Building2,
  BarChart3
} from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

const isActive = (path) => {
  if (path === "/superadmin") {
    return location.pathname === "/superadmin"
      ? "bg-[#1E293B] text-white"
      : "text-gray-300 hover:bg-[#1E293B] hover:text-white";
  }

  return location.pathname === path
    ? "bg-[#1E293B] text-white"
    : "text-gray-300 hover:bg-[#1E293B] hover:text-white";
};

  return (
    <div className="flex h-screen bg-[#F8FAFC]">

      {/* Sidebar */}
      <div className="w-64 bg-[#0F172A] text-gray-200 flex flex-col shadow-xl">

        {/* Logo */}
        <div className="p-6 text-2xl font-bold border-b border-gray-700 tracking-wide">
          DYCI | DMS
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 text-sm">

          {/* ================= SUPERADMIN ================= */}
          {user?.role === "SuperAdmin" && (
            <>
              <button
                onClick={() => navigate("/superadmin")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/superadmin")}`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>

              <button
                onClick={() => navigate("/superadmin/departments")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/superadmin/departments")}`}
              >
                <Building2 size={16} />
                Departments
              </button>

              <button
                onClick={() => navigate("/superadmin/admins")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/superadmin/admins")}`}
              >
                <Users size={16} />
                Admins
              </button>

              <button
                onClick={() => navigate("/superadmin/coadmins")}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#1E293B] transition"
              >
                <Users size={16} />
                Co Admins
              </button>

              <button
                onClick={() => navigate("/superadmin/logs")}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#1E293B] transition"
              >
                <Activity size={16} />
                Global Logs
              </button>

<button
  onClick={() => navigate("/superadmin/advanced-analytics")}
  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[#1E293B] transition"
>
  <BarChart3 size={16} />
  Advanced Analytics
</button>
            </>
          )}

          {/* ================= ADMIN ================= */}
          {user?.role === "Admin" && (
            <>
              <button
                onClick={() => navigate("/admin")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/admin")}`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>

              <button
                onClick={() => navigate("/admin/folders")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/admin/folders")}`}
              >
                <Folder size={16} />
                Folder Explorer
              </button>

              <button
                onClick={() => navigate("/admin/logs")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/admin/logs")}`}
              >
                <Activity size={16} />
                Activity Logs
              </button>

              <button
                onClick={() => navigate("/admin/coadmins")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/admin/coadmins")}`}
              >
                <Users size={16} />
                Manage CoAdmins
              </button>

              <button
                onClick={() => navigate("/admin/recycle-bin")}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/admin/recycle-bin")}`}
              >
                <Trash2 size={16} />
                Recycle Bin
              </button>
            </>
          )}

          {/* ================= COADMIN ================= */}
          {user?.role === "CoAdmin" && (
            <button
              onClick={() => navigate("/coadmin")}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${isActive("/coadmin")}`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          )}

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="text-lg font-semibold text-gray-800">
            {user?.role} Panel
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}