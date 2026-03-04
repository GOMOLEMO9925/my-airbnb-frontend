import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Reservations = () => {
  const { token, user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const path = user?.role === "host" ? "/api/reservations/host" : "/api/reservations/user";
        const data = await apiFetch(path, {}, token);
        setReservations(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token, user]);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/reservations/${id}`, { method: "DELETE" }, token);
      setReservations((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <h1>Your reservations</h1>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((item) => (
              <tr key={item._id}>
                <td>{item.listingTitle || item.listingId}</td>
                <td>{item.checkIn}</td>
                <td>{item.checkOut}</td>
                <td>{item.guests}</td>
                <td>${item.total}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(item._id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;
