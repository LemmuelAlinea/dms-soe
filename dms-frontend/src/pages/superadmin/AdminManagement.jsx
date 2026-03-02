import { useEffect, useState } from "react";
import api from "../../services/api";
import { Plus, Trash2, KeyRound, X } from "lucide-react";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
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
    const res = await api.get("/api/superadmin/admins");
    setAdmins(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get("/api/superadmin/departments");
    setDepartments(res.data);
  };

  const handleCreate = async () => {
    if (!firstName || !lastName || !email || !password || !departmentID) {
      return alert("All required fields must be filled");
    }

    await api.post("/api/superadmin/admins", {
      firstName,
      middleName,
      lastName,
      email,
      password,
      departmentID
    });

    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setDepartmentID("");

    fetchAdmins();
  };

  const handleDelete = async () => {
    await api.delete(`/api/superadmin/admins/${deleteUser.userID}`);
    setDeleteUser(null);
    fetchAdmins();
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    await api.put(
      `/api/superadmin/users/reset-password/${resetUser.userID}`,
      { newPassword }
    );

    setResetUser(null);
    setNewPassword("");
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-gray-800">
        Admin Management
      </h1>

      {/* CREATE ADMIN */}
      <div className="bg-white border rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm uppercase tracking-wide">
          <Plus size={16} />
          Create Admin
        </div>

        <div className="grid grid-cols-5 gap-4">
          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border p-3 rounded-lg text-sm"
          />

          <input
            placeholder="Middle Name (Optional)"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            className="border p-3 rounded-lg text-sm"
          />

          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border p-3 rounded-lg text-sm"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg text-sm"
          />

          <select
            value={departmentID}
            onChange={(e) => setDepartmentID(e.target.value)}
            className="border p-3 rounded-lg text-sm col-span-2"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.departmentID} value={dept.departmentID}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-slate-800 text-white px-6 py-3 rounded-lg"
        >
          Create Admin
        </button>
      </div>

      {/* ADMIN LIST */}
      <div className="bg-white border rounded-2xl p-6 shadow-md">
        {admins.length === 0 ? (
          <p className="text-gray-500 text-sm">No admins found.</p>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin.userID}
                className="border rounded-xl p-5 flex justify-between items-center"
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
                    className="text-yellow-600"
                  >
                    <KeyRound size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteUser(admin)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteUser && (
        <Modal onClose={() => setDeleteUser(null)}>
          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Delete Admin
          </h2>
          <p className="mb-6">
            Delete <strong>{deleteUser.fullName}</strong>?
          </p>
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-3 rounded-lg"
          >
            Confirm Delete
          </button>
        </Modal>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetUser && (
        <Modal onClose={() => setResetUser(null)}>
          <h2 className="text-lg font-semibold mb-4">
            Reset Password
          </h2>

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            onClick={handleResetPassword}
            className="w-full bg-slate-800 text-white py-3 rounded-lg"
          >
            Confirm Reset
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[420px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}