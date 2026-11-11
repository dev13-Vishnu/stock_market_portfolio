// src/App.js
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import "./App.css";

function computeColor(stock) {
  if (!stock) return "black";
  const current = stock.initial_price;
  const compare = stock.price_2007;
  if (typeof current === "number" && typeof compare === "number") {
    return current >= compare ? "green" : "red";
  }
  return "black";
}

const Stocks = ({ addToWatchlist }) => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/stocks")
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((error) => console.error("Error fetching stocks:", error));
  }, []);

  return (
    <div className="App" style={{ padding: 16 }}>
      <h1>Stock Market MERN App</h1>
      <h2>Stocks</h2>
      <ul>
        {stocks.map((stock) => (
          <li key={stock._id || stock.symbol} style={{ marginBottom: 8 }}>
            <strong>{stock.company}</strong> ({stock.symbol}) -
            <span style={{ color: computeColor(stock), marginLeft: 8 }}>
              ${stock.initial_price ?? "N/A"}
            </span>
            <button
              style={{ marginLeft: 12 }}
              onClick={() => addToWatchlist(stock)}
            >
              Add to My Watchlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Watchlist = ({ watchlist }) => {
  return (
    <div className="App" style={{ padding: 16 }}>
      <h1>Stock Market MERN App</h1>
      <h2>My Watchlist</h2>
      {watchlist.length === 0 ? (
        <p>No items in watchlist.</p>
      ) : (
        <ul>
          {watchlist.map((item) => {
            const stock = item.stockId || item;
            return (
              <li key={item._id} style={{ marginBottom: 8 }}>
                <strong>{stock.company}</strong> ({stock.symbol}) -
                <span style={{ marginLeft: 8 }}>
                  ${stock.initial_price ?? "N/A"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

function App() {
  const [watchlist, setWatchlist] = useState([]);

  const loadWatchlist = () => {
    fetch("http://localhost:5000/api/watchlist")
      .then((res) => res.json())
      .then((data) => setWatchlist(data))
      .catch((err) => console.error("Error loading watchlist:", err));
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const addToWatchlist = (stock) => {
    fetch("http://localhost:5000/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId: stock._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Action completed");
        loadWatchlist();
      })
      .catch((error) => {
        console.error("Error adding to watchlist:", error);
        alert("Failed to add to watchlist");
      });
  };

  return (
    <Router>
      <nav style={{ padding: 12 }}>
        <NavLink to="/stocks" style={{ marginRight: 12 }}>
          Stocks
        </NavLink>
        <NavLink to="/watchlist">Watchlist</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/stocks" replace />} />
        <Route path="/stocks" element={<Stocks addToWatchlist={addToWatchlist} />} />
        <Route path="/watchlist" element={<Watchlist watchlist={watchlist} />} />
      </Routes>
    </Router>
  );
}

export default App;