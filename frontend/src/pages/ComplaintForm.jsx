import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const ComplaintForm = ({ user }) => {
  const navigate = useNavigate();
  
  // Default to Andhra Pradesh, India
  const [location, setLocation] = useState({ lat: 15.9129, lng: 79.74 });
  // Detect user location automatically on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);
  const [locationText, setLocationText] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");

    if (!user || !token) {
      Swal.fire({
        title: "Account Required",
        text: "Please sign up or sign in to submit a complaint.",
        icon: "info",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sign Up",
        denyButtonText: "Sign In",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#38a169",
        denyButtonColor: "#2f855a",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/signup");
        } else if (result.isDenied) {
          navigate("/login");
        }
      });
      return;
    }

    const formData = new FormData();
    formData.append("location", locationText);
    formData.append("mapLocation", JSON.stringify(location));
    formData.append("description", description);
    formData.append("image", image);
    formData.append("wasteType", wasteType);
    formData.append("username", user.username);
    formData.append("email", user.email);

    try {
      console.log('Submitting complaint with token:', token ? 'Token exists' : 'No token');
      const response = await api.post(
        "/complaints",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log('Complaint submission successful:', response.data);
      
      Swal.fire({
        title: "Complaint Submitted!",
        text: "Your complaint has been successfully submitted. We will address it soon.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#38a169",
      });

      setSuccessMessage("Complaint submitted successfully!");
      setLocation({ lat: 15.9129, lng: 79.74 });
      setImage(null);
      setDescription("");
      setWasteType("");
      setLocationText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
      Swal.fire({
        title: "Failed to Submit",
        text: err.response?.data?.message || "Failed to submit complaint. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setLocation({ lat, lng });

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            setLocationText(results[0].formatted_address);
          } else {
            console.log("No address found for this location");
          }
        } else {
          console.error("Geocoder failed due to: " + status);
        }
      });
    }
  };

  return (

    <div className="max-w-screen-lg mx-auto py-16 px-6">

      <div className="">
        {error && <p className="text-red-600 text-center">{error}</p>}
        {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
      </div>


      <form onSubmit={handleSubmit} className="space-y-12">


        {/* Step 1: Location and Waste Type */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="font-semibold text-2xl text-gray-800 mb-6">Step 1: Location & Waste Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Location *</label>
              <input
                type="text"
                value={locationText}
                onChange={e => setLocationText(e.target.value)}
                required
                placeholder="Enter location"
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Waste Type *</label>
              <select
                value={wasteType}
                onChange={e => setWasteType(e.target.value)}
                required
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="">Select waste type</option>
                <option value="plastic">Plastic Waste</option>
                <option value="mixed">Mixed Waste</option>
                <option value="electronic">Electronic Waste</option>
                <option value="organic">Organic Waste</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Description and Upload Image */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="font-semibold text-2xl text-gray-800 mb-6">Step 2: Description & Upload Image</h2>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              placeholder="Describe the waste issue in detail"
              rows={4}
              className="w-full p-4 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Upload Image</label>
            {!image ? (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-4 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            ) : (
              <div className="relative inline-block border-2 border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Upload preview"
                  className="max-h-48 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition duration-200 flex items-center justify-center"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
                <div className="mt-2 text-xs text-gray-500 max-w-xs truncate font-medium">
                  {image.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Select Location on Map (Full width) */}
        <div className="bg-white rounded-xl shadow-lg p-8 w-full">
          <h2 className="font-semibold text-2xl text-gray-800 mb-6">Step 3: Select Location on Map</h2>
          <LoadScriptNext googleMapsApiKey="AIzaSyDKo47VQpTFtD9jXhJH7V8p_7FrcXbJtTs" loadingElement={<div>Loading Maps...</div>}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              center={location}
              zoom={8}
              onClick={handleMapClick}
              className="rounded-xl shadow-md"
            >
              {location.lat && location.lng && (
                <Marker position={{ lat: location.lat, lng: location.lng }} />
              )}
            </GoogleMap>
          </LoadScriptNext>
        </div>


        <div className="mt-6 text-center">
    <button
      type="submit"
      className="px-8 py-3 bg-white text-green border border-green-800 hover:bg-green-700 focus:ring-2 focus:ring-white hover:text-white transition duration-300"
    >
      Submit Complaint
    </button>
  </div>
      </form>



    </div>

  );
};

// PropTypes validation
ComplaintForm.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
};

export default ComplaintForm;
