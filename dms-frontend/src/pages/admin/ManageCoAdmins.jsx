import { useEffect, useState } from "react";
import api from "../../services/api";
import { UserPlus, Trash2, Users } from "lucide-react";

export default function ManageCoAdmins() {
  const [coadmins, setCoadmins] = useState([]);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
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
    const res = await api.get("/api/admins");
    setCoadmins(res.data);
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      return alert("All required fields must be filled");
    }

    await api.post("/api/admins", {
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    });

    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: ""
    });

    fetchCoadmins();
  };

  const confirmDelete = async () => {
    await api.delete(`/api/admins/${selectedUser.userID}`);
    setShowDeleteModal(false);
    setSelectedUser(null);
    fetchCoadmins();
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
        <Users size={22} />
        Manage CoAdmins
      </h1>

      <div className="bg-white border rounded-2xl p-6 shadow-md space-y-5">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <UserPlus size={18} />
          Create New CoAdmin
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
            className="border rounded-lg p-3 text-sm"
          />

          <input
            placeholder="Middle Name (Optional)"
            value={form.middleName}
            onChange={(e) =>
              setForm({ ...form, middleName: e.target.value })
            }
            className="border rounded-lg p-3 text-sm"
          />

          <input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
            className="border rounded-lg p-3 text-sm"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="border rounded-lg p-3 text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="border rounded-lg p-3 text-sm"
          />
        </div>

        <button
          onClick={handleCreate}
          className="bg-slate-800 text-white px-6 py-2 rounded-lg"
        >
          Create CoAdmin
        </button>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-md">
        {coadmins.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No CoAdmins yet.
          </p>
        ) : (
          <div className="space-y-4">
            {coadmins.map((user) => (
              <div
                key={user.userID}
                className="flex justify-between items-center border-b pb-3"
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
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl space-y-5">
            <h2 className="text-lg font-semibold">
              Confirm Deletion
            </h2>

            <p>
              Delete <strong>{selectedUser?.fullName}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
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