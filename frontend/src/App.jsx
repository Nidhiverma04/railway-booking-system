import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home          from './components/Home';
import Signup        from './components/Signup';
import Login         from './components/Login';
import SearchResults from './components/SearchResults';
import Dashboard     from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/Signup"    element={<Signup />} />
          <Route path="/Login"     element={<Login />} />
          <Route path="/results"   element={<SearchResults />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
