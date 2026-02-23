import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

login(
  res.data.token,
  res.data.role,
  res.data.mustChangePassword
);
if (res.data.mustChangePassword) {
  navigate("/change-password");
  return;
}

      if (res.data.role === "SuperAdmin") navigate("/superadmin");
      if (res.data.role === "Admin") navigate("/admin");
      if (res.data.role === "CoAdmin") navigate("/coadmin");

    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">

      <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-10 animate-slideUp">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          DYCI Document Management
        </h2>

        <p className="text-gray-500 text-sm text-center mb-8">
          Internal Document Storage System
        </p>

        {/* Email Field */}
        <div className="relative mb-5">
          <Mail
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-200 pl-10 pr-3 py-3 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Field */}
        <div className="relative mb-6">
          <Lock
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-200 pl-10 pr-3 py-3 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg text-sm font-medium transition duration-200"
        >
          Sign In
        </button>

      </div>
    </div>
  );
}