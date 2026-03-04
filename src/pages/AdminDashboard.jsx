import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  const loadListings = async () => {
    try {
      setError("");
      const data = await apiFetch("/api/accommodations/mine", {}, token);
      setListings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) {
      return;
    }

    try {
      await apiFetch(`/api/accommodations/${id}`, { method: "DELETE" }, token);
      setListings((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page admin">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <Link className="primary" to="/admin/create">Create listing</Link>
      </div>

      {error && <p className="error">{error}</p>}

      {!error && listings.length === 0 ? (
        <p className="muted">
          {user?.role === "admin" ? "No listings found." : "You have not created any listings yet."}
        </p>
      ) : null}

      <div className="list">
        {listings.map((item) => (
          <div className="list-card" key={item._id}>
            <img src={item.images?.[0] || "https://via.placeholder.com/240"} alt={item.title} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.location}</p>
              <p>${item.price} / night</p>
              <div className="actions">
                <Link to={`/admin/update/${item._id}`}>Update</Link>
                <button type="button" onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
