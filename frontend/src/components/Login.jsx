import React from "react";
import RouteLogo from "../assets/route.png";
import { Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <img src={RouteLogo} alt="RailWise Logo" className="w-12 h-12 object-contain" />
          <span className="text-3xl px-1.5 font-serif font-bold tracking-tight">
            Railwise
          </span>
        </div>

        <button className="text-sm font-bold border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 transition">
          Back to Home
        </button>
      </nav>

      {/* LOGIN SECTION */}
      <div
        className="flex-1 flex items-center justify-center px-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20, 12, 15, 0.8), rgba(20, 12, 15, 0.8)), url('https://th.bing.com/th/id/OIP.CLo7grbkncWpUw4UuglUtwHaEK?w=2000&h=auto&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
          
          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-slate-500 text-sm">
              Login to continue your journey with Railwise
            </p>
          </div>

          {/* FORM */}
          <form className="flex flex-col gap-5">
            
            {/* Email */}
            <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <Mail size={18} className="text-indigo-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none text-sm font-medium text-slate-700"
              />
            </div>

            {/* Password */}
            <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <Lock size={18} className="text-indigo-500" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full outline-none text-sm font-medium text-slate-700"
              />
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
              Login
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Signup */}
          <p className="text-center text-sm text-slate-500">
            Don’t have an account?{" "}
            <span className="text-indigo-600 font-bold cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;