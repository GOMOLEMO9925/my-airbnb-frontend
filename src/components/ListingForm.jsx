import { useMemo, useState } from "react";

const defaultForm = {
  title: "",
  location: "",
  description: "",
  bedrooms: 1,
  bathrooms: 1,
  guests: 1,
  type: "",
  price: 0,
  amenities: "",
  images: "",
  weeklyDiscount: 0,
  cleaningFee: 0,
  serviceFee: 0,
  occupancyTaxes: 0
};

const parseImageList = (value) => {
  const rows = String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const output = [];

  rows.forEach((row) => {
    if (row.startsWith("data:image/")) {
      output.push(row);
      return;
    }

    if (row.includes(",")) {
      row
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => output.push(item));
      return;
    }

    output.push(row);
  });

  return output;
};

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
};

const ListingForm = ({ initialValues = defaultForm, onSubmit, submitLabel, onCancel }) => {
  const initialImages = Array.isArray(initialValues.images)
    ? initialValues.images.join("\n")
    : initialValues.images || "";

  const [form, setForm] = useState({ ...defaultForm, ...initialValues, images: initialImages });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const imageListPreview = useMemo(() => parseImageList(form.images), [form.images]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["bedrooms", "bathrooms", "guests", "price", "weeklyDiscount", "cleaningFee", "serviceFee", "occupancyTaxes"].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      setUploadingImages(true);
      setError("");
      const dataUrls = await Promise.all(files.map((file) => fileToDataUrl(file)));
      setForm((prev) => {
        const current = parseImageList(prev.images);

        return {
          ...prev,
          images: [...current, ...dataUrls].join("\n")
        };
      });
      event.target.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const nextImages = imageListPreview.filter((_, index) => index !== indexToRemove);
    setForm((prev) => ({
      ...prev,
      images: nextImages.join("\n")
    }));
  };

  const validate = () => {
    if (form.title.trim().length < 3) {
      return "Title must be at least 3 characters.";
    }

    if (form.location.trim().length < 2) {
      return "Location is required.";
    }

    if (form.description.trim().length < 20) {
      return "Description must be at least 20 characters.";
    }

    if (!form.type.trim()) {
      return "Property type is required.";
    }

    if (form.price <= 0) {
      return "Price must be greater than 0.";
    }

    if (form.bedrooms < 1 || form.bathrooms < 1 || form.guests < 1) {
      return "Bedrooms, bathrooms, and guests must be at least 1.";
    }

    if (form.weeklyDiscount < 0 || form.cleaningFee < 0 || form.serviceFee < 0 || form.occupancyTaxes < 0) {
      return "Discounts and fees cannot be negative.";
    }

    if (imageListPreview.length === 0) {
      return "Add at least one image URL or upload an image.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      images: imageListPreview
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form listing-form" onSubmit={handleSubmit}>
      <div className="listing-grid">
        <label>
          Listing name
          <input name="title" value={form.title} onChange={handleChange} />
        </label>

        <div className="compact-grid">
          <label>
            Rooms
            <input type="number" name="bedrooms" min="1" value={form.bedrooms} onChange={handleChange} />
          </label>
          <label>
            Baths
            <input type="number" name="bathrooms" min="1" value={form.bathrooms} onChange={handleChange} />
          </label>
          <label>
            Guests
            <input type="number" name="guests" min="1" value={form.guests} onChange={handleChange} />
          </label>
        </div>

        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
        <label>
          Type
          <input name="type" value={form.type} onChange={handleChange} />
        </label>

        <label className="full-row">
          Description
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>

        <label>
          Amenities (comma separated)
          <input name="amenities" value={form.amenities} onChange={handleChange} />
        </label>

        <label>
          Price per night
          <input type="number" name="price" min="1" value={form.price} onChange={handleChange} />
        </label>

        <label className="full-row">
          Image URLs (one per line)
          <textarea
            name="images"
            value={form.images}
            onChange={handleChange}
            placeholder={"https://example.com/1.jpg\nhttps://example.com/2.jpg"}
          />
        </label>

        <label className="full-row">
          Upload images
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          {uploadingImages ? <span className="muted">Uploading image files...</span> : null}
        </label>

        {imageListPreview.length > 0 ? (
          <div className="full-row image-preview-grid">
            {imageListPreview.map((image, index) => (
              <div key={`${image.slice(0, 24)}-${index}`} className="image-preview-card">
                <img src={image} alt={`Listing ${index + 1}`} />
                <button type="button" className="outline-btn" onClick={() => handleRemoveImage(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <label>
          Weekly discount (%)
          <input type="number" name="weeklyDiscount" min="0" value={form.weeklyDiscount} onChange={handleChange} />
        </label>
        <label>
          Cleaning fee
          <input type="number" name="cleaningFee" min="0" value={form.cleaningFee} onChange={handleChange} />
        </label>
        <label>
          Service fee
          <input type="number" name="serviceFee" min="0" value={form.serviceFee} onChange={handleChange} />
        </label>
        <label>
          Occupancy taxes
          <input type="number" name="occupancyTaxes" min="0" value={form.occupancyTaxes} onChange={handleChange} />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={submitting || uploadingImages}>{submitting ? "Saving..." : submitLabel}</button>
        {onCancel ? <button type="button" className="danger-btn" onClick={onCancel}>Cancel</button> : null}
      </div>
    </form>
  );
};

export default ListingForm;
