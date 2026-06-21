import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import SearchResults from './components/SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/Signup"  element={<Signup />} />
        <Route path="/Login"   element={<Login />} />
        <Route path="/results" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
