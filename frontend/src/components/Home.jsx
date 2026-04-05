import React from 'react';
import Footer from './Footer';
import RouteLogo from '../assets/route.png'; 
import { Search, ArrowRightLeft, MapPin, Calendar, User, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.0 rounded-lg">
            <img src={RouteLogo} alt="RailWise Logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-3xl px-1.5 font-serif font-bold tracking-tight text-slate-900">Railwise</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
          <a href="#" className="text-indigo-600">Trains</a>
          <a href="#" className="hover:text-slate-900">PNR Status</a>
          <a href="#" className="hover:text-slate-900">Live Running</a>
        </div>
        <button
          onClick={() => navigate("/Signup")}
          className="text-sm font-bold border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Login / Signup
        </button>
      </nav>

      {/*SEARCH AREA */}
      <div 
        className="relative bg-cover bg-center pb-32 pt-16 px-6"
        style={{ 
          backgroundImage: `linear-gradient(rgba(20, 12, 15, 0.8), rgba(20, 12, 15, 0.8)), url('https://images.unsplash.com/photo-1532105956626-9569c03602f6?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Journey Starts Here
            </h1>
            <p className="text-indigo-100 text-lg opacity-90">
              Book train tickets for over 5,000+ destinations across the country.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              
              {/* Route Input */}
              <div className="lg:col-span-5 flex flex-col md:flex-row items-center gap-2 relative">
                <div className="w-full border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                  <MapPin size={18} className="text-indigo-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">From</span>
                    <input type="text" placeholder="Delhi" className="font-bold outline-none text-slate-700 w-full" />
                  </div>
                </div>
                
                <button className="bg-white border border-slate-200 p-2 rounded-full absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 z-10 shadow-md hover:bg-slate-50 active:scale-90 transition">
                  <ArrowRightLeft size={16} className="text-indigo-600" />
                </button>

                <div className="w-full border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                  <MapPin size={18} className="text-rose-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">To</span>
                    <input type="text" placeholder="Mumbai" className="font-bold outline-none text-slate-700 w-full" />
                  </div>
                </div>
              </div>

              {/* Date & Search */}
              <div className="lg:col-span-3 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Travel Date</span>
                  <input type="date" className="font-bold outline-none text-slate-700 w-full bg-transparent" />
                </div>
              </div>

              <div className="lg:col-span-2 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Class</span>
                  <select className="font-bold outline-none text-slate-700 w-full bg-transparent appearance-none">
                    <option>All Classes</option>
                    <option>Sleeper (SL)</option>
                    <option>1st AC</option>
                    <option>2nd AC (2A)</option>
                    <option>3rd AC (3A)</option>
                  </select>
                </div>
              </div>

              <button className="lg:col-span-2 bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
                <Search size={20} className="group-hover:scale-110 transition" />
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intermediate trains result*/}
      <section className="max-w-6xl mx-auto -mt-12 px-6 pb-20 relative z-10">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded tracking-wide">NEW</span>
            <h2 className="font-bold text-slate-800">Alternative Connections</h2>
            <Info size={14} className="text-slate-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-100 rounded-xl p-5 hover:border-indigo-200 transition bg-slate-50/50 group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-slate-500">Delhi → Mumbai</p>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">DIRECT FULL</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-[2px] bg-indigo-200 relative">
                  <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 border border-indigo-100 rounded text-[9px] font-bold text-indigo-600 shadow-sm">VIA KOTA</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Suggested: <span className="text-slate-800 font-bold">2 Trains</span></p>
                <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition">View Details <ChevronRight size={14} /></button>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 hover:border-indigo-200 transition group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-slate-500">Delhi → Chennai</p>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">RAC AVAILABLE</span>
              </div>
              <p className="text-sm text-slate-700 font-medium mb-4">Probability of Confirmation: <span className="text-green-600 font-bold">92%</span></p>
              <button className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition">Monitor Seat</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;