import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { listings } from "../data/listings.js";
import { apiFetch } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const daysBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

const featureRows = [
  { title: "Entire home", text: "You'll have the apartment to yourself." },
  { title: "Enhanced Clean", text: "This host committed to Airbnb's enhanced cleaning process." },
  { title: "Self check-in", text: "Check yourself in with the lockbox." },
  { title: "Free cancellation", text: "Free cancellation before Feb 14." }
];

const LocationDetails = () => {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/api/accommodations/${id}`);
        setListing(data);
      } catch (err) {
        const fallback = listings.find((item) => item.id === id);
        setListing(fallback || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadReviews = async () => {
    try {
      setReviewsError("");
      const data = await apiFetch(`/api/reviews?listingId=${id}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviews([]);
      setReviewsError(err.message);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);

  if (loading) {
    return <p className="page">Loading...</p>;
  }

  if (!listing) {
    return <p className="page">Listing not found.</p>;
  }

  const base = listing.price * nights;
  const discount = nights >= 7 ? listing.weeklyDiscount : 0;
  const totalDiscount = base * (discount / 100);
  const total = base - totalDiscount + listing.cleaningFee + listing.serviceFee + listing.occupancyTaxes;

  const ratingMap = listing.specificRatings || {
    cleanliness: listing.rating || 5,
    communication: listing.rating || 5,
    checkIn: listing.rating || 5,
    accuracy: listing.rating || 5,
    location: listing.rating || 5,
    value: listing.rating || 5
  };

  const handleReserve = async () => {
    setError("");
    setMessage("");

    if (!isAuthenticated) {
      const nextPath = `${location.pathname}${location.search}`;
      navigate(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Select check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      setError("Check-out must be after check-in.");
      return;
    }

    try {
      await apiFetch(
        "/api/reservations",
        {
          method: "POST",
          body: JSON.stringify({
            listingId: listing._id || listing.id,
            checkIn,
            checkOut,
            guests,
            total
          })
        },
        token
      );
      setMessage("Reservation created.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateReview = async (event) => {
    event.preventDefault();
    setReviewSubmitError("");
    setReviewSubmitMessage("");

    if (!isAuthenticated) {
      setReviewSubmitError("Log in to leave a review.");
      return;
    }

    if (reviewComment.trim().length < 5) {
      setReviewSubmitError("Review must be at least 5 characters.");
      return;
    }

    try {
      await apiFetch(
        "/api/reviews",
        {
          method: "POST",
          body: JSON.stringify({
            listingId: listing._id || listing.id,
            rating: Number(reviewRating),
            comment: reviewComment.trim(),
            cleanliness: Number(reviewRating),
            communication: Number(reviewRating),
            checkIn: Number(reviewRating),
            accuracy: Number(reviewRating),
            location: Number(reviewRating),
            value: Number(reviewRating)
          })
        },
        token
      );
      setReviewComment("");
      setReviewRating(5);
      setReviewSubmitMessage("Review added.");
      loadReviews();
    } catch (err) {
      setReviewSubmitError(err.message);
    }
  };

  return (
    <div className="page details details-figma">
      <section className="section details-header">
        <h1>{listing.title}</h1>
        <div className="details-meta-row">
          <p>★ {listing.rating || 0} · {listing.reviews || 0} reviews · Superhost · {listing.location}</p>
          <p>Share · Save</p>
        </div>
      </section>

      <section className="gallery figma-gallery">
        <img className="main" src={listing.images?.[0] || "https://via.placeholder.com/800"} alt={listing.title} />
        <div className="side-grid">
          {(listing.images || []).slice(1, 5).map((img, index) => (
            <img key={index} src={img} alt={`${listing.title} ${index + 1}`} />
          ))}
        </div>
      </section>

      <section className="details-grid figma-main-grid">
        <div className="details-main-flow">
          <div className="host-header">
            <div>
              <h2>Entire rental unit hosted by {listing.host || "Ghazal"}</h2>
              <p>{listing.guests} guests · {listing.bedrooms} bedroom · 1 bed · {listing.bathrooms} bath</p>
            </div>
            <span className="avatar host-avatar" aria-hidden="true">☻</span>
          </div>

          <div className="feature-list">
            {featureRows.map((feature) => (
              <div key={feature.title} className="feature-item">
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="details-copy">
            <p>{listing.description}</p>
            <button type="button" className="text-link">Show more</button>
          </div>

          <div className="section-block">
            <h3>Where you'll sleep</h3>
            <article className="sleep-card">
              <img src={listing.images?.[1] || listing.images?.[0] || "https://via.placeholder.com/500"} alt="Bedroom" />
              <div>
                <h4>Bedroom</h4>
                <p>1 queen bed</p>
              </div>
            </article>
          </div>

          <div className="section-block">
            <h3>What this place offers</h3>
            <ul className="amenity-grid">
              {(listing.amenities || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button type="button" className="outline-btn">Show all amenities</button>
          </div>

          <div className="section-block">
            <h3>★ {listing.rating || 0} · {listing.reviews || 0} reviews</h3>
            <div className="rating-grid">
              {Object.entries(ratingMap).map(([name, score]) => (
                <div className="rating-row" key={name}>
                  <span>{name}</span>
                  <span className="rating-line" aria-hidden="true" />
                  <strong>{Number(score).toFixed(1)}</strong>
                </div>
              ))}
            </div>

            <form className="review-form" onSubmit={handleCreateReview}>
              <h4>Leave a review</h4>
              <label>
                Rating
                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Comment
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} />
              </label>
              <button type="submit">Submit review</button>
              {reviewSubmitError ? <p className="error">{reviewSubmitError}</p> : null}
              {reviewSubmitMessage ? <p className="success">{reviewSubmitMessage}</p> : null}
            </form>

            {reviewsError ? <p className="error">{reviewsError}</p> : null}
            <div className="review-grid">
              {reviews.map((review) => (
                <article key={review._id} className="review-card">
                  <h4>{review.username}</h4>
                  <p className="muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                  <p className="muted">★ {Number(review.rating).toFixed(1)}</p>
                  <p>{review.comment}</p>
                </article>
              ))}
              {!reviews.length ? <p className="muted">No reviews yet.</p> : null}
            </div>
          </div>

          <div className="section-block host-card">
            <h3>Hosted by {listing.host || "Ghazal"}</h3>
            <p className="muted">Ghazal is a Superhost</p>
            <p className="muted">Response rate: 100%</p>
            <p className="muted">Response time: within an hour</p>
            <button type="button" className="outline-btn">Contact Host</button>
          </div>

          <div className="section-block rules-grid">
            <h3>Things to know</h3>
            <div>
              <h4>House rules</h4>
              <p>Check-in: After 4:00 PM</p>
              <p>Checkout: 10:00 AM</p>
            </div>
            <div>
              <h4>Health & safety</h4>
              <p>Committed to Airbnb's enhanced cleaning process.</p>
              <p>Smoke alarm and carbon monoxide alarm.</p>
            </div>
            <div>
              <h4>Cancellation policy</h4>
              <p>Free cancellation before Feb 14.</p>
            </div>
          </div>
        </div>

        <aside className="calculator">
          <h3><strong>${listing.price}</strong> / night</h3>
          <p>★ {listing.rating || 0} · {listing.reviews || 0} reviews</p>
          <label>
            Check-in
            <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
          </label>
          <label>
            Check-out
            <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
          </label>
          <label>
            Guests
            <input
              type="number"
              min="1"
              max={listing.guests}
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
            />
          </label>

          <button type="button" onClick={handleReserve}>Reserve</button>
          <p className="muted centered">You won't be charged yet</p>

          <div className="breakdown">
            <p><span>${listing.price} x {nights || 0} nights</span><span>${base.toFixed(2)}</span></p>
            <p><span>Weekly discount</span><span>-${totalDiscount.toFixed(2)}</span></p>
            <p><span>Cleaning fee</span><span>${listing.cleaningFee}</span></p>
            <p><span>Service fee</span><span>${listing.serviceFee}</span></p>
            <p><span>Occupancy taxes</span><span>${listing.occupancyTaxes}</span></p>
          </div>

          <div className="total">Total: ${Number.isFinite(total) ? total.toFixed(2) : "0.00"}</div>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
        </aside>
      </section>
    </div>
  );
};

export default LocationDetails;
