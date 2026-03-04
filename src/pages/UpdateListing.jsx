import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListingForm from "../components/ListingForm.jsx";
import { apiFetch } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const UpdateListing = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const data = await apiFetch(`/api/accommodations/${id}`, {}, token);
        setInitialValues({
          ...data,
          amenities: (data.amenities || []).join(", "),
          images: (data.images || []).join("\n")
        });
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id, token]);

  const handleUpdate = async (payload) => {
    try {
      setError("");
      await apiFetch(
        `/api/accommodations/${id}`,
        {
          method: "PUT",
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
      <h1>Update Listing</h1>
      {error && <p className="error">{error}</p>}
      {initialValues ? (
        <ListingForm
          initialValues={initialValues}
          onSubmit={handleUpdate}
          submitLabel="Update"
          onCancel={() => navigate("/admin")}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UpdateListing;
