import { useEffect, useState } from "react";
import api from "../../services/api";
import { UserPlus, Trash2, Users } from "lucide-react";

export default function ManageCoAdmins() {
  const [coadmins, setCoadmins] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchCoadmins();
  }, []);

  const fetchCoadmins = async () => {
    try {
      const res = await api.get("/api/admins");
      setCoadmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.fullName || !form.email || !form.password) {
        alert("All fields required");
        return;
      }

      await api.post("/api/admins", {
        ...form,
        role: "CoAdmin"
      });

      setForm({
        fullName: "",
        email: "",
        password: ""
      });

      fetchCoadmins();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to create CoAdmin");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/admins/${selectedUser.userID}`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchCoadmins();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
        <Users size={22} />
        Manage CoAdmins
      </h1>

      {/* CREATE CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md space-y-5">

        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <UserPlus size={18} />
          Create New CoAdmin
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
            className="border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleCreate}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm transition"
        >
          Create CoAdmin
        </button>
      </div>

      {/* LIST CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">

        <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-5">
          Department CoAdmins
        </h2>

        {coadmins.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No CoAdmins yet.
          </p>
        ) : (
          <div className="space-y-4">
            {coadmins.map((user) => (
              <div
                key={user.userID}
                className="flex justify-between items-center border-b border-gray-100 pb-3"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl space-y-5">

            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Deletion
            </h2>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {selectedUser?.fullName}
              </span>?
            </p>

            <div className="flex justify-end gap-3 pt-4">

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}