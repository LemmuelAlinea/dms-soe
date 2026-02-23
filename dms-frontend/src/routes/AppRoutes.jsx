import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import CoAdminDashboard from "../pages/coadmin/CoAdminDashboard";
import RecycleBin from "../pages/admin/RecycleBin";
import FolderExplorer from "../pages/admin/FolderExplorer";
import Logs from "../pages/admin/Logs";
import ManageCoAdmins from "../pages/admin/ManageCoAdmins";
import Departments from "../pages/superadmin/Departments";
import AdminManagement from "../pages/superadmin/AdminManagement";
import ChangePassword from "../pages/ChangePassword";
import CoAdmins from "../pages/superadmin/CoAdmins";
import GlobalLogs from "../pages/superadmin/GlobalLogs";
import SuperAdminAdvancedAnalytics from "../pages/superadmin/SuperAdminAdvancedAnalytics";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/folders" element={<FolderExplorer />} />
        <Route path="/admin/recycle-bin" element={<RecycleBin />} />
        <Route path="/admin/logs" element={<Logs />} />
        <Route path="/admin/coadmins" element={<ManageCoAdmins />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/departments" element={<Departments />} />
        <Route path="/superadmin/admins" element={<AdminManagement />} />
        <Route path="/superadmin/coadmins" element={<CoAdmins />} />
        <Route path="/superadmin/logs" element={<GlobalLogs />} />
        <Route path="/superadmin/advanced-analytics" element={<SuperAdminAdvancedAnalytics />} />

        <Route path="/coadmin" element={<CoAdminDashboard />} />
        

        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}