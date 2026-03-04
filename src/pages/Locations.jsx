import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listings } from "../data/listings.js";
import { apiFetch } from "../utils/api.js";

const Locations = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(listings);
  const [location, setLocation] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const locationFromParams = (searchParams.get("location") || "").trim();

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiFetch("/api/accommodations");
        if (Array.isArray(result) && result.length > 0) {
          setData(result);
        }
      } catch (err) {
        setData(listings);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchLocation = location === "All" || item.location === location;
      const matchPrice = item.price <= maxPrice;
      const haystack = [
        item.title,
        item.location,
        item.type,
        ...(item.amenities || [])
      ]
        .join(" ")
        .toLowerCase();
      const matchQuery = !query || haystack.includes(query);
      return matchLocation && matchPrice && matchQuery;
    });
  }, [data, location, maxPrice, query]);

  const locations = ["All", ...new Set(data.map((item) => item.location))];

  useEffect(() => {
    if (!locationFromParams) {
      setLocation("All");
      return;
    }

    const matchingLocation = locations.find(
      (item) => item.toLowerCase() === locationFromParams.toLowerCase()
    );
    setLocation(matchingLocation || "All");
  }, [locationFromParams, data]);

  return (
    <div className="page locations">
      <section className="filters">
        <div>
          <label htmlFor="location">Destination</label>
          <select id="location" value={location} onChange={(event) => setLocation(event.target.value)}>
            {locations.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="price">Max price / night</label>
          <input
            id="price"
            type="number"
            min="50"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          />
        </div>
      </section>

      <section className="section">
        <h2>
          {filtered.length} stays in {location === "All" ? "popular places" : location}
          {query ? ` for "${query}"` : ""}
        </h2>
        <div className="list">
          {filtered.map((item) => (
            <Link to={`/locations/${item._id || item.id}`} className="list-card" key={item._id || item.id}>
              <img src={item.images?.[0] || "https://via.placeholder.com/240"} alt={item.title} />
              <div className="list-card-content">
                <p className="muted">{item.type} · {item.bedrooms} bedrooms</p>
                <h3>{item.title}</h3>
                <p className="muted">{(item.amenities || []).join(" · ")}</p>
                <p className="price-line">
                  <span>⭐ {item.rating || 0} ({item.reviews || 0})</span>
                  <span><strong>${item.price}</strong> night</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Locations;
