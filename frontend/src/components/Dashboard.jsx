import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Train, Calendar, MapPin, Clock, CheckCircle,
  XCircle, AlertTriangle, LogOut, ArrowRight, Search
} from 'lucide-react';
import RouteLogo from '../assets/route.png';

const API = 'http://localhost:5000';

function StatusBadge({ status }) {
  const styles = {
    CNF      : 'bg-green-100 text-green-700',
    RAC      : 'bg-yellow-100 text-yellow-700',
    WL       : 'bg-orange-100 text-orange-700',
    CANCELLED: 'bg-red-100 text-red-600',
  };
  const icons = {
    CNF      : <CheckCircle size={12} />,
    RAC      : <AlertTriangle size={12} />,
    WL       : <Clock size={12} />,
    CANCELLED: <XCircle size={12} />,
  };
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${styles[status] || styles.CNF}`}>
      {icons[status]} {status}
    </span>
  );
}

function BookingCard({ booking, onCancel }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(true);
    await onCancel(booking.booking_id);
    setCancelling(false);
  };

  const passengers = typeof booking.passengers === 'string'
    ? JSON.parse(booking.passengers)
    : booking.passengers;

  const journeyDate = new Date(booking.journey_date);
  const isPast      = journeyDate < new Date();

  return (
    <div className={`bg-white border rounded-xl p-5 transition ${
      booking.status === 'CANCELLED' ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-slate-800">{booking.train_name}</p>
            <span className="text-xs text-slate-400">#{booking.train_number}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={13} className="text-indigo-400" />
            <span className="font-medium">{booking.from_name}</span>
            <ArrowRight size={13} className="text-slate-300" />
            <span className="font-medium">{booking.to_name}</span>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {journeyDate.toDateString()}
          {isPast && booking.status !== 'CANCELLED' && (
            <span className="ml-1 text-slate-400">(Past)</span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Train size={12} />
          {booking.class || 'SL'}
        </span>
        <span className="flex items-center gap-1">
          {passengers?.length} passenger{passengers?.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Passengers */}
      {passengers?.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Passengers</p>
          <div className="space-y-1">
            {passengers.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">{p.name}</span>
                <span className="text-slate-400">{p.age}y · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PNR + actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">PNR</p>
          <p className="font-black text-indigo-700 tracking-widest text-sm">{booking.pnr}</p>
        </div>
        {booking.status !== 'CANCELLED' && !isPast && (
          <button onClick={handleCancel} disabled={cancelling}
            className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('upcoming');

  useEffect(() => {
    if (!user) { navigate('/Login'); return; }
    fetchBookings();
  }, [user]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/api/bookings`);
      const data = await res.json();
      if (res.ok) setBookings(data);
      else if (res.status === 401) { logout(); navigate('/Login'); }
      else setError(data.error);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    try {
      const res = await authFetch(`${API}/api/bookings/${id}/cancel`, { method: 'PATCH' });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.booking_id === id ? { ...b, status: 'CANCELLED' } : b
        ));
      }
    } catch {
      alert('Failed to cancel booking');
    }
  }

  const now      = new Date();
  const upcoming = bookings.filter(b => b.status !== 'CANCELLED' && new Date(b.journey_date) >= now);
  const past     = bookings.filter(b => b.status !== 'CANCELLED' && new Date(b.journey_date) <  now);
  const cancelled= bookings.filter(b => b.status === 'CANCELLED');

  const tabs = [
    { key: 'upcoming',  label: 'Upcoming',  count: upcoming.length  },
    { key: 'past',      label: 'Past',      count: past.length      },
    { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ];

  const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 lg:px-20 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={RouteLogo} alt="Railwise" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-serif font-bold tracking-tight text-slate-900">Railwise</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-bold border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
            <Search size={15} /> Search Trains
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-sm font-bold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length,    color: 'indigo' },
            { label: 'Upcoming',       value: upcoming.length,    color: 'green'  },
            { label: 'Cancelled',      value: cancelled.length,   color: 'red'    },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className={`text-3xl font-black text-${s.color}-600`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                tab === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {t.label}
              <span className="ml-1.5 opacity-70">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Loading your bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && !error && shown.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-xl p-12 text-center">
            <Train size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-600 mb-1">No {tab} bookings</p>
            <p className="text-sm text-slate-400 mb-5">
              {tab === 'upcoming' ? "Book your next journey today." : `No ${tab} trips found.`}
            </p>
            {tab === 'upcoming' && (
              <button onClick={() => navigate('/')}
                className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                Search Trains
              </button>
            )}
          </div>
        )}

        {!loading && shown.length > 0 && (
          <div className="space-y-4">
            {shown.map(b => (
              <BookingCard key={b.booking_id} booking={b} onCancel={cancelBooking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
