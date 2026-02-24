import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Users,
  Plus,
  Trash2,
  KeyRound,
  X
} from "lucide-react";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentID, setDepartmentID] = useState("");

  const [deleteUser, setDeleteUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchAdmins();
    // eslint-disable-next-line react-hooks/immutability
    fetchDepartments();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/api/superadmin/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/api/superadmin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     CREATE ADMIN
  ========================= */
  const handleCreate = async () => {
    if (!fullName || !email || !password || !departmentID) {
      return alert("All fields required");
    }

    try {
      await api.post("/api/superadmin/admins", {
        fullName,
        email,
        password,
        departmentID
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setDepartmentID("");

      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create admin");
    }
  };

  /* =========================
     DELETE ADMIN
  ========================= */
  const handleDelete = async () => {
    try {
      await api.delete(
        `/api/superadmin/admins/${deleteUser.userID}`
      );

      setDeleteUser(null);
      fetchAdmins();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* =========================
     RESET PASSWORD
  ========================= */
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    try {
      await api.put(
        `/api/superadmin/users/reset-password/${resetUser.userID}`,
        { newPassword }
      );

      alert("Password reset successfully");
      setResetUser(null);
      setNewPassword("");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Reset failed");
    }
  };

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-gray-800">
        Admin Management
      </h1>

      {/* =========================
          CREATE ADMIN
      ========================= */}
      <div className="bg-white border border-gray-00 rounded-2xl p-6 shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)]">

        <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm uppercase tracking-wide">
          <Plus size={16} />
          Create Admin
        </div>

        <div className="grid grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            value={departmentID}
            onChange={(e) => setDepartmentID(e.target.value)}
            className="border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option
                key={dept.departmentID}
                value={dept.departmentID}
              >
                {dept.departmentName}
              </option>
            ))}
          </select>

        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-[#0F172A] text-white px-6 py-3 rounded-lg text-sm hover:bg-[#1E293B] transition"
        >
          Create Admin
        </button>
      </div>

      {/* =========================
          ADMIN LIST
      ========================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">

        {admins.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No admins found.
          </p>
        ) : (
          <div className="space-y-4">

            {admins.map((admin) => (
              <div
                key={admin.userID}
                className="border border-gray-500 rounded-xl p-5 flex justify-between items-center hover:shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)] transition"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {admin.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {admin.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    Department: {admin.departmentName || "N/A"}
                  </div>
                </div>

                <div className="flex gap-4">

                  <button
                    onClick={() => setResetUser(admin)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <KeyRound size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteUser(admin)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* =========================
          DELETE MODAL
      ========================= */}
      {deleteUser && (
        <Modal onClose={() => setDeleteUser(null)}>

          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Delete Admin
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete{" "}
            <strong>{deleteUser.fullName}</strong>?
          </p>

          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            Confirm Delete
          </button>

        </Modal>
      )}

      {/* =========================
          RESET PASSWORD MODAL
      ========================= */}
      {resetUser && (
        <Modal onClose={() => setResetUser(null)}>

          <h2 className="text-lg font-semibold mb-4">
            Reset Password
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Reset password for <strong>{resetUser.fullName}</strong>
          </p>

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            onClick={handleResetPassword}
            className="w-full bg-[#0F172A] text-white py-3 rounded-lg hover:bg-[#1E293B] transition"
          >
            Confirm Reset
          </button>

        </Modal>
      )}

    </div>
  );
}

/* =========================
   SIMPLE MODAL
========================= */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>

        {children}
      </div>
    </div>
  );
}