import React from "react";
import RouteLogo from "../assets/route.png";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

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

        <button
          onClick={() => navigate("/")}
          className="text-sm font-bold border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Back to Home
        </button>
      </nav>

      {/* SIGNUP SECTION */}
      <div
        className="flex-1 flex items-center justify-center px-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20, 12, 15, 0.8), rgba(20, 12, 15, 0.8)), url('https://wpassets.adda247.com/wp-content/uploads/multisite/sites/5/2020/09/11134657/Railways-Green-Mission.jpg?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
          
          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Create Account 🚀
            </h2>
            <p className="text-slate-500 text-sm">
              Sign up to start booking your journeys
            </p>
          </div>

          {/* FORM */}
          <form className="flex flex-col gap-5">
            
            {/* Name */}
            <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <User size={18} className="text-indigo-500" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full outline-none text-sm font-medium text-slate-700"
              />
            </div>

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
                placeholder="Create password"
                className="w-full outline-none text-sm font-medium text-slate-700"
              />
            </div>

            {/* Button */}
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
              Sign Up
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </form>

          {/* Already signed up */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Already signed up?{" "}
            <span
              onClick={() => navigate("/Login")}
              className="text-indigo-600 font-bold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;