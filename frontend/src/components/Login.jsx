import React, { useState } from "react";
import RouteLogo from "../assets/route.png";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/login", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token); // ← saves both user + JWT token
        navigate("/dashboard");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <nav className="flex items-center justify-between px-6 lg:px-20 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <img src={RouteLogo} alt="RailWise Logo" className="w-12 h-12 object-contain" />
          <span className="text-3xl px-1.5 font-serif font-bold tracking-tight">Railwise</span>
        </div>
        <button onClick={() => navigate("/")} className="text-sm font-bold border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 transition">
          Back to Home
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6"
        style={{ backgroundImage: "linear-gradient(rgba(20,12,15,0.8),rgba(20,12,15,0.8)),url('https://th.bing.com/th/id/OIP.CLo7grbkncWpUw4UuglUtwHaEK?w=2000&h=auto&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3?q=80&w=2000&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back 👋</h2>
            <p className="text-slate-500 text-sm">Login to continue your journey with Railwise</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <Mail size={18} className="text-indigo-500" />
              <input type="email" placeholder="Enter your email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full outline-none text-sm font-medium text-slate-700" required />
            </div>
            <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <Lock size={18} className="text-indigo-500" />
              <input type="password" placeholder="Enter your password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full outline-none text-sm font-medium text-slate-700" required />
            </div>
            <button type="submit" disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
              {loading ? "Logging in..." : "Login"}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition" />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <span onClick={() => navigate("/Signup")} className="text-indigo-600 font-bold cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
