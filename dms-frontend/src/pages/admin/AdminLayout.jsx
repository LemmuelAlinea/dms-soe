import { Link, Outlet } from "react-router-dom";
import { LayoutDashboard, Folder, Trash2 } from "lucide-react";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

        <nav className="space-y-4 text-sm">
          <Link
            to="/api/admin/dashboard"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <Link
            to="/api/admin/folders"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <Folder size={16} />
            Folder Explorer
          </Link>

          <Link
            to="/api/admin/recycle-bin"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <Trash2 size={16} />
            Recycle Bin
          </Link>
        </nav>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>

    </div>
  );
}