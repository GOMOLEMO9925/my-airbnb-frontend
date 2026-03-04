import { useNavigate } from "react-router-dom";
import ListingForm from "../components/ListingForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../utils/api.js";
import { useState } from "react";

const CreateListing = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    try {
      setError("");
      await apiFetch(
        "/api/accommodations",
        {
          method: "POST",
          body: JSON.stringify(payload)
        },
        token
      );
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page create-listing-page">
      <h1>Create Listing</h1>
      {error && <p className="error">{error}</p>}
      <ListingForm onSubmit={handleCreate} submitLabel="Create" onCancel={() => navigate("/admin")} />
    </div>
  );
};

export default CreateListing;
