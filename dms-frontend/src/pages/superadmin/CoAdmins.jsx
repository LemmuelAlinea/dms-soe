import { useEffect, useState } from "react";
import api from "../../services/api";
import { Users, KeyRound, X } from "lucide-react";

export default function CoAdmins() {
  const [coadmins, setCoAdmins] = useState([]);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchCoAdmins();
  }, []);

  const fetchCoAdmins = async () => {
    try {
      const res = await api.get("/api/superadmin/coadmins");
      setCoAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

      <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
        <Users size={20} />
        Co Admins
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">

        {coadmins.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No CoAdmins found.
          </p>
        ) : (
          <div className="space-y-4">

            {coadmins.map((user) => (
              <div
                key={user.userID}
                className="border border-gray-500 rounded-xl p-5 flex justify-between items-center hover:shadow-[0px_0px_12px_0px_rgba(0,_0,_0,_0.8)] transition"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {user.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    Department: {user.departmentName || "N/A"}
                  </div>
                </div>

                <button
                  onClick={() => setResetUser(user)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <KeyRound size={16} />
                </button>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* RESET MODAL */}
      {resetUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl relative">

            <button
              onClick={() => setResetUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Reset Password
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Reset password for <strong>{resetUser.fullName}</strong>
            </p>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4"
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-[#0F172A] text-white py-3 rounded-lg hover:bg-[#1E293B]"
            >
              Confirm Reset
            </button>

          </div>
        </div>
      )}

    </div>
  );
}