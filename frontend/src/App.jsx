import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth }  from './context/AuthContext';
import Home          from './components/Home';
import Signup        from './components/Signup';
import Login         from './components/Login';
import SearchResults from './components/SearchResults';
import Dashboard     from './components/Dashboard';
import { useNavigate } from 'react-router-dom';

function SessionBanner() {
  const { sessionExpired, setSessionExpired } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpired) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>⏱</span>
        <span>Your session has expired. Please log in again to continue booking.</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSessionExpired(false); navigate('/Login'); }}
          className="bg-white text-orange-600 font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-orange-50 transition"
        >
          Log In
        </button>
        <button
          onClick={() => setSessionExpired(false)}
          className="text-white/70 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <SessionBanner />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/Signup"    element={<Signup />} />
        <Route path="/Login"     element={<Login />} />
        <Route path="/results"   element={<SearchResults />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
