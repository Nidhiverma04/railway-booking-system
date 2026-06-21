import React, { useState, useRef, useEffect } from 'react';
import Footer from './Footer';
import RouteLogo from '../assets/route.png';
import { Search, ArrowRightLeft, MapPin, Calendar, User, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

function StationInput({ label, placeholder, value, onSelect, icon: Icon, iconColor }) {
  const [query, setQuery] = useState(value?.station_name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (value) setQuery(value.station_name);
  }, [value]);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(() => {
      fetch(`${API}/api/stations/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => { setSuggestions(data); setOpen(true); })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-white">
        <Icon size={18} className={iconColor} />
        <div className="flex flex-col flex-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{label}</span>
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); onSelect(null); }}
            className="font-bold outline-none text-slate-700 w-full bg-transparent"
          />
        </div>
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto mt-1">
          {suggestions.map(s => (
            <button
              key={s.station_id}
              className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex justify-between items-center text-sm"
              onMouseDown={() => { onSelect(s); setQuery(s.station_name); setOpen(false); }}
            >
              <span className="font-medium text-slate-800">{s.station_name}</span>
              <span className="text-xs text-slate-400 font-mono">{s.station_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState(null);
  const [to, setTo]   = useState(null);
  const [date, setDate] = useState('');
  const [travelClass, setTravelClass] = useState('');
  const [err, setErr] = useState('');

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    if (!from || !to) { setErr('Please select both source and destination stations.'); return; }
    setErr('');
    navigate(
      `/results?from=${from.station_id}&to=${to.station_id}` +
      `&fromName=${encodeURIComponent(from.station_name)}&toName=${encodeURIComponent(to.station_name)}` +
      `&date=${date}&class=${travelClass}`
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <img src={RouteLogo} alt="RailWise Logo" className="w-12 h-12 object-contain" />
          <span className="text-3xl px-1.5 font-serif font-bold tracking-tight text-slate-900">Railwise</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
          <a href="#" className="text-indigo-600">Trains</a>
          <a href="#" className="hover:text-slate-900">PNR Status</a>
          <a href="#" className="hover:text-slate-900">Live Running</a>
        </div>
        <button
          onClick={() => navigate('/Signup')}
          className="text-sm font-bold border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Login / Signup
        </button>
      </nav>

      {/* SEARCH AREA */}
      <div
        className="relative bg-cover bg-center pb-32 pt-16 px-6"
        style={{ backgroundImage: `linear-gradient(rgba(20,12,15,0.8),rgba(20,12,15,0.8)),url('https://images.unsplash.com/photo-1532105956626-9569c03602f6?q=80&w=2000&auto=format&fit=crop')` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Journey Starts Here</h1>
            <p className="text-indigo-100 text-lg opacity-90">Book train tickets — direct or via intermediate stations.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-white/20">
            {err && <p className="text-red-500 text-sm mb-3 font-medium">{err}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

              {/* Station inputs */}
              <div className="lg:col-span-5 flex flex-col md:flex-row items-center gap-2 relative">
                <StationInput
                  label="From" placeholder="Delhi" value={from} onSelect={setFrom}
                  icon={MapPin} iconColor="text-indigo-500"
                />
                <button
                  onClick={handleSwap}
                  className="bg-white border border-slate-200 p-2 rounded-full z-10 shadow-md hover:bg-slate-50 active:scale-90 transition shrink-0"
                >
                  <ArrowRightLeft size={16} className="text-indigo-600" />
                </button>
                <StationInput
                  label="To" placeholder="Mumbai" value={to} onSelect={setTo}
                  icon={MapPin} iconColor="text-rose-500"
                />
              </div>

              {/* Date */}
              <div className="lg:col-span-3 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Travel Date</span>
                  <input
                    type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="font-bold outline-none text-slate-700 w-full bg-transparent"
                  />
                </div>
              </div>

              {/* Class */}
              <div className="lg:col-span-2 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Class</span>
                  <select
                    value={travelClass} onChange={e => setTravelClass(e.target.value)}
                    className="font-bold outline-none text-slate-700 w-full bg-transparent appearance-none"
                  >
                    <option value="">All Classes</option>
                    <option value="SL">Sleeper (SL)</option>
                    <option value="1A">1st AC</option>
                    <option value="2A">2nd AC (2A)</option>
                    <option value="3A">3rd AC (3A)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="lg:col-span-2 bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <Search size={20} className="group-hover:scale-110 transition" />
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature highlight */}
      <section className="max-w-6xl mx-auto -mt-12 px-6 pb-20 relative z-10">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded tracking-wide">SMART</span>
            <h2 className="font-bold text-slate-800">How Alternative Routing Works</h2>
            <Info size={14} className="text-slate-300" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-bold text-slate-800 mb-1">1. Direct Search</p>
              <p>Find all trains running directly between your stations.</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="font-bold text-indigo-800 mb-1">2. Dijkstra Routing</p>
              <p>When no direct train has seats, our graph engine finds the fastest path via intermediate stations.</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="font-bold text-orange-800 mb-1">3. Connection Safety</p>
              <p>Transfer buffer is validated — risky connections are flagged before you book.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
