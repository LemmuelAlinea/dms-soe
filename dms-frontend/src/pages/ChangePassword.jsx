import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = async () => {
    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    try {
      await api.put("/auth/change-password", {
        newPassword: password
      });

      localStorage.setItem("mustChangePassword", false);

      alert("Password changed successfully");

      const role = localStorage.getItem("role");

      if (role === "SuperAdmin") navigate("/superadmin");
      if (role === "Admin") navigate("/admin");
      if (role === "CoAdmin") navigate("/coadmin");

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to change password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px]">

        <h2 className="text-xl font-semibold mb-6 text-center">
          Change Your Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleChange}
          className="w-full bg-[#0F172A] text-white py-3 rounded-lg hover:bg-[#1E293B]"
        >
          Update Password
        </button>

      </div>
    </div>
  );
}