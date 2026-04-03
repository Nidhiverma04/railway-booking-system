import { useState } from "react";
import SearchTrains from "./components/SearchTrains";
import BookingPage from "./components/BookingPage";
import MyBookings from "./components/MyBookings";
import AdminDashboard from "./components/AdminDashboard";
import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("search");
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const handleBookTrain = (train, params) => {
    setSelectedTrain(train);
    setSearchParams(params);
    setPage("book");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🚆</span>
            <div>
              <div className="logo-title">RAILWISE</div>
              <div className="logo-sub">Smart Railway Reservation</div>
            </div>
          </div>
          <nav className="nav">
            {[
              { key: "search", label: "Search Trains" },
              { key: "bookings", label: "My Bookings" },
              { key: "admin", label: "Admin" },
            ].map((item) => (
              <button
                key={item.key}
                className={`nav-btn ${page === item.key ? "active" : ""}`}
                onClick={() => setPage(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {page === "search" && (
          <SearchTrains onBook={handleBookTrain} />
        )}
        {page === "book" && selectedTrain && (
          <BookingPage
            train={selectedTrain}
            searchParams={searchParams}
            onBack={() => setPage("search")}
            onSuccess={() => setPage("bookings")}
          />
        )}
        {page === "bookings" && <MyBookings />}
        {page === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}