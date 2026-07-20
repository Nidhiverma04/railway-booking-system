import React, { useState } from 'react';
import { X, Plus, Trash2, User, Train, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';
const CLASSES = ['SL', '3A', '2A', '1A', 'CC', '2S'];

export default function BookingModal({ route, fromId, toId, fromName, toName, date, onClose }) {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: 'M' }
  ]);
  const [travelClass, setTravelClass] = useState('SL');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [booked, setBooked]           = useState(null); // PNR after success

  // redirect to login if not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <Train size={40} className="text-indigo-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg mb-2">Login Required</h3>
          <p className="text-slate-500 text-sm mb-6">You need to be logged in to book tickets.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={() => navigate('/Login')} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([...passengers, { name: '', age: '', gender: 'M' }]);
  };

  const removePassenger = (i) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  };

  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i][field] = value;
    setPassengers(updated);
  };

  const handleBook = async () => {
    // validate
    for (const p of passengers) {
      if (!p.name.trim()) return setError('All passenger names are required');
      if (!p.age || p.age < 1 || p.age > 120) return setError('Please enter valid age for all passengers');
    }
    setError('');
    setLoading(true);

    const firstLeg = route.legs[0];
    const lastLeg  = route.legs[route.legs.length - 1];

    try {
      const res = await authFetch(`${API}/api/bookings`, {
        method: 'POST',
        body: JSON.stringify({
          train_id    : firstLeg.trainId,
          from_station: parseInt(fromId),
          to_station  : parseInt(toId),
          journey_date: date || new Date().toISOString().split('T')[0],
          travel_class: travelClass,
          passengers,
          route_type  : route.type,
          legs        : route.legs.length,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBooked(data.pnr);
      } else if (res.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-xl mb-1">Booking Confirmed!</h3>
          <p className="text-slate-500 text-sm mb-4">Your PNR number is</p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4 mb-6">
            <p className="text-2xl font-black text-indigo-700 tracking-widest">{booked}</p>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            {fromName} → {toName} · {passengers.length} passenger{passengers.length > 1 ? 's' : ''} · {travelClass}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-slate-200 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Close
            </button>
            <button onClick={() => { onClose(); navigate('/dashboard'); }}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────────
  const firstLeg = route.legs[0];
  const lastLeg  = route.legs[route.legs.length - 1];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg my-4">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Book Ticket</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fromName} → {toName} · {firstLeg.trainName}
              {route.legs.length > 1 && ` + ${route.legs.length - 1} more`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Journey summary */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="font-black text-slate-800 text-lg">{route.departure}</p>
              <p className="text-slate-400 text-xs">{firstLeg.fromCode}</p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-0.5 bg-indigo-200 mx-4 relative">
                <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-indigo-600" />
                <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-indigo-600" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{route.type === 'direct' ? 'Direct' : `${route.legs.length} trains`}</p>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-800 text-lg">{route.arrival}</p>
              <p className="text-slate-400 text-xs">{lastLeg.toCode}</p>
            </div>
          </div>

          {/* Travel class */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Travel Class</label>
            <div className="flex gap-2 flex-wrap">
              {CLASSES.map(c => (
                <button key={c} onClick={() => setTravelClass(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    travelClass === c
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase">Passengers</label>
              <button onClick={addPassenger} disabled={passengers.length >= 6}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 transition">
                <Plus size={14} /> Add Passenger
              </button>
            </div>

            <div className="space-y-3">
              {passengers.map((p, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <User size={12} /> Passenger {i + 1}
                    </span>
                    {passengers.length > 1 && (
                      <button onClick={() => removePassenger(i)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="Full name" value={p.name}
                      onChange={e => updatePassenger(i, 'name', e.target.value)}
                      className="col-span-3 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition" />
                    <input type="number" placeholder="Age" value={p.age} min="1" max="120"
                      onChange={e => updatePassenger(i, 'age', e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition" />
                    <select value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}
                      className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition bg-white">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey date */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block items-center gap-1">
              <Calendar size={12} /> Journey Date
            </label>
            <input type="date" defaultValue={date || new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleBook} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-bold transition">
            {loading ? 'Confirming...' : `Confirm Booking (${passengers.length} pax)`}
          </button>
        </div>
      </div>
    </div>
  );
}
