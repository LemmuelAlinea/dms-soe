import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import DashboardLayout from "../layouts/DashboardLayout";

// ================= ADMIN =================
import AdminDashboard from "../pages/admin/AdminDashboard";
import FolderExplorer from "../pages/admin/FolderExplorer";
import RecycleBin from "../pages/admin/RecycleBin";
import Logs from "../pages/admin/Logs";
import ManageCoAdmins from "../pages/admin/ManageCoAdmins";

// ================= SUPERADMIN =================
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import Departments from "../pages/superadmin/Departments";
import AdminManagement from "../pages/superadmin/AdminManagement";
import GlobalLogs from "../pages/superadmin/GlobalLogs";
import SuperAdminAdvancedAnalytics from "../pages/superadmin/SuperAdminAdvancedAnalytics";

// ================= COADMIN =================
import CoAdminDashboard from "../pages/coadmin/CoAdminDashboard";
import CoAdminFolders from "../pages/coadmin/CoAdminFolders";
import CoAdminLogs from "../pages/coadmin/CoAdminLogs";
import CoAdminRecycleBin from "../pages/coadmin/CoAdminRecycleBin";

// ================= SHARED =================
import ChangePassword from "../pages/ChangePassword";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<DashboardLayout />}>

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/folders" element={<FolderExplorer />} />
        <Route path="/admin/recycle-bin" element={<RecycleBin />} />
        <Route path="/admin/logs" element={<Logs />} />
        <Route path="/admin/coadmins" element={<ManageCoAdmins />} />

        {/* ================= SUPERADMIN ================= */}
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/departments" element={<Departments />} />
        <Route path="/superadmin/admins" element={<AdminManagement />} />
        <Route path="/superadmin/logs" element={<GlobalLogs />} />
        <Route
          path="/superadmin/advanced-analytics"
          element={<SuperAdminAdvancedAnalytics />}
        />

        {/* ================= COADMIN ================= */}
        <Route path="/coadmin" element={<CoAdminDashboard />} />
        <Route path="/coadmin/folders" element={<CoAdminFolders />} />
        <Route path="/coadmin/logs" element={<CoAdminLogs />} />
        <Route path="/coadmin/recycle-bin" element={<CoAdminRecycleBin />} />

        {/* ================= PASSWORD ================= */}
        <Route path="/change-password" element={<ChangePassword />} />

      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}