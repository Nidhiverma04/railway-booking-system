import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, CheckCircle, Clock, Train, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import BookingModal from './BookingModal';

const API = 'http://localhost:5000';

function minutesToTime(m) {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function formatDuration(mins) {
  if (!mins || mins === Infinity) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function RiskBadge({ risk }) {
  const styles = { LOW: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HIGH: 'bg-red-100 text-red-700' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${styles[risk] || styles.LOW}`}>{risk} RISK</span>;
}

function DirectCard({ route, onBook }) {
  const leg = route.legs[0];
  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-slate-800">{leg.trainName}</p>
          <p className="text-xs text-slate-400">#{leg.trainNumber} · {leg.trainType}</p>
        </div>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">DIRECT</span>
      </div>
      <div className="flex items-center gap-4 my-3">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800">{route.departure}</p>
          <p className="text-xs text-slate-400">{leg.fromCode}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-1">{formatDuration(route.totalDuration)}</p>
          <div className="w-full h-0.5 bg-indigo-200 relative">
            <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-indigo-600" />
            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-indigo-600" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800">{route.arrival}</p>
          <p className="text-xs text-slate-400">{leg.toCode}</p>
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <button onClick={() => onBook(route)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition">
          Book Now
        </button>
      </div>
    </div>
  );
}

function IndirectCard({ route, onBook }) {
  const [expanded, setExpanded] = useState(false);
  const legs = route.legs || [];
  const intermediate = route.intermediate || [];

  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-slate-800">
            Via{' '}
            {intermediate.map((m, i) => (
              <span key={i}>
                <span className="text-indigo-600">{m.name || m}</span>
                {i < intermediate.length - 1 && <span className="text-slate-400 mx-1">→</span>}
              </span>
            ))}
          </p>
          <p className="text-xs text-slate-400">{legs.map(l => l.trainName).join(' → ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge risk={route.connectionRisk} />
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{legs.length} TRAINS</span>
        </div>
      </div>

      <div className="flex items-center gap-3 my-3">
        <div className="text-center min-w-[48px]">
          <p className="text-lg font-bold text-slate-800">{route.departure}</p>
          <p className="text-xs text-slate-400">{legs[0]?.fromCode}</p>
        </div>
        <div className="flex-1">
          <div className="h-0.5 bg-indigo-200 relative">
            <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-indigo-600" />
            {intermediate.map((m, i) => (
              <div key={i} className="absolute -top-4 text-[9px] font-bold text-indigo-600 bg-white border border-indigo-100 px-1 py-0.5 rounded whitespace-nowrap"
                style={{ left: `${((i + 1) / (legs.length)) * 100}%`, transform: 'translateX(-50%)' }}>
                {m.code || m}
              </div>
            ))}
            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-indigo-600" />
          </div>
        </div>
        <div className="text-center min-w-[48px]">
          <p className="text-lg font-bold text-slate-800">{route.arrival}</p>
          <p className="text-xs text-slate-400">{legs[legs.length - 1]?.toCode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          Total: <b className="text-slate-700 ml-1">{formatDuration(route.totalDuration)}</b>
        </span>
        <span className="flex items-center gap-1">
          <Train size={12} />
          {legs.length - 1} change{legs.length > 2 ? 's' : ''}
        </span>
      </div>

      <button onClick={() => setExpanded(e => !e)}
        className="text-xs text-indigo-600 font-bold flex items-center gap-1 mb-2">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide' : 'Show'} leg details
      </button>

      {expanded && (
        <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-2 mb-3">
          {legs.map((leg, i) => (
            <div key={i} className="flex justify-between">
              <span className="font-bold">{leg.trainName} ({leg.trainNumber})</span>
              <span className="font-mono">{leg.fromCode} {leg.depMin != null ? minutesToTime(leg.depMin) : '—'} → {leg.toCode} {leg.arrMin != null ? minutesToTime(leg.arrMin) : '—'}</span>
            </div>
          ))}
        </div>
      )}

      {route.connectionRisk === 'HIGH' && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-700 mb-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>Tight connection. Train delays may cause you to miss the connecting train.</span>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => onBook(route)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition">
          Book This Route
        </button>
      </div>
    </div>
  );
}

// ── Date grid helpers ─────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getDateGrid(centerDate) {
  // returns array of 7 Date objects: -3 to +3 days around centerDate
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i - 3);
    return d;
  });
}

function toDateString(d) {
  // YYYY-MM-DD
  return d.toISOString().split('T')[0];
}

function DateGrid({ selectedDate, onSelect }) {
  const center = selectedDate ? new Date(selectedDate) : new Date();
  const grid   = getDateGrid(center);
  const today  = toDateString(new Date());

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {grid.map((d, i) => {
        const ds        = toDateString(d);
        const isSelected = ds === selectedDate;
        const isToday    = ds === today;
        const isPast     = d < new Date(today);

        return (
          <button
            key={i}
            onClick={() => !isPast && onSelect(ds)}
            disabled={isPast}
            className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold min-w-[52px] transition border
              ${isSelected
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : isPast
                  ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
          >
            <span className={`text-[10px] font-bold mb-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
              {isToday ? 'Today' : DAY_NAMES[d.getDay()]}
            </span>
            <span className="text-base leading-none">{d.getDate()}</span>
            <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
              {MONTH_NAMES[d.getMonth()]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params   = new URLSearchParams(location.search);

  const fromId   = params.get('from');
  const toId     = params.get('to');
  const fromName = params.get('fromName') || 'Source';
  const toName   = params.get('toName')   || 'Destination';
  const date     = params.get('date')     || toDateString(new Date());

  const [selectedDate, setSelectedDate] = useState(date);
  const [loading,      setLoading]      = useState(true);
  const [results,      setResults]      = useState(null);
  const [error,        setError]        = useState(null);
  const [tab,          setTab]          = useState('direct');
  const [bookingRoute, setBookingRoute] = useState(null);

  // re-fetch when date changes OR route changes
  useEffect(() => {
    if (!fromId || !toId) { setError('Invalid search parameters'); setLoading(false); return; }
    setLoading(true);
    setResults(null);
    fetch(`${API}/api/trains/search?from=${fromId}&to=${toId}&date=${selectedDate}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setResults(data);
        if (!data.direct.length && data.indirect.length) setTab('indirect');
        else setTab('direct');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fromId, toId, selectedDate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                <span>{fromName}</span>
                <ArrowRight size={16} className="text-slate-400" />
                <span>{toName}</span>
              </div>
              <p className="text-xs text-slate-400">{new Date(selectedDate).toDateString()}</p>
            </div>
          </div>
          {/* ±3 day date grid */}
          <DateGrid selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Searching trains and building route graph…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {results && !loading && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                <span className="font-bold text-slate-700">{results.direct.length}</span>
                <span className="text-slate-500">direct</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5 text-sm">
                <Train size={16} className="text-indigo-500" />
                <span className="font-bold text-slate-700">{results.indirect.length}</span>
                <span className="text-slate-500">via intermediate</span>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setTab('direct')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab === 'direct' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Direct Trains ({results.direct.length})
              </button>
              <button onClick={() => setTab('indirect')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab === 'indirect' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Via Intermediate ({results.indirect.length})
                {results.indirect.length > 0 && tab !== 'indirect' && (
                  <span className="ml-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">NEW</span>
                )}
              </button>
            </div>

            {tab === 'direct' && (
              results.direct.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-8 text-center">
                  <Train size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-600 mb-1">No direct trains found</p>
                  <p className="text-sm text-slate-400 mb-4">Try the "Via Intermediate" tab to find connecting routes.</p>
                  <button onClick={() => setTab('indirect')} className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-lg text-sm">
                    Show Connecting Trains
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.direct.map((r, i) => <DirectCard key={i} route={r} onBook={setBookingRoute} />)}
                </div>
              )
            )}

            {tab === 'indirect' && (
              results.indirect.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-8 text-center">
                  <p className="font-bold text-slate-600">No intermediate routes found</p>
                  <p className="text-sm text-slate-400">Try a different source or destination.</p>
                </div>
              ) : (
                <>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4 flex items-start gap-2 text-xs text-indigo-700">
                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                    <span>Routes found via Yen's K-Shortest Paths. Minimum <b>30-minute transfer buffer</b> enforced at every junction.</span>
                  </div>
                  <div className="space-y-4">
                    {results.indirect.map((r, i) => <IndirectCard key={i} route={r} onBook={setBookingRoute} />)}
                  </div>
                </>
              )
            )}
          </>
        )}
      </div>

      {/* Booking modal — mounts when user clicks Book Now */}
      {bookingRoute && (
        <BookingModal
          route={bookingRoute}
          fromId={fromId}
          toId={toId}
          fromName={fromName}
          toName={toName}
          date={date}
          onClose={() => setBookingRoute(null)}
        />
      )}
    </div>
  );
}
