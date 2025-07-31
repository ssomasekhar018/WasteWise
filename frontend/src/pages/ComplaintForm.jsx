import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ComplaintForm = ({ user }) => {
  const navigate = useNavigate();
  
  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!user) {
      Swal.fire({
        title: "Not Logged In",
        text: "Please log in to submit a complaint",
        icon: "warning",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#38a169",
      }).then(() => {
        navigate("/login");
      });
    }
  }, [user, navigate]);
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Complaint Submitted!",
      text: "Your complaint has been successfully submitted. We will address it soon.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#38a169",
    });

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in first.");
      return;
    }

    

    const formData = new FormData();
    formData.append("location", locationText);
    formData.append("mapLocation", JSON.stringify(location));
    formData.append("description", description);
    formData.append("image", image);
    formData.append("wasteType", wasteType);
    
    // Only append user data if user exists
    if (user) {
      formData.append("username", user.username);
      formData.append("email", user.email);
    } else {
      // Handle case when user is not available
      setError("User information not available. Please log in again.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/complaints",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccessMessage("Complaint submitted successfully!");
      setLocation({ lat: null, lng: null });
      setImage(null);
      setDescription("");
      setLocationText("");
      setWasteType("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    }
  };

  const handleMapClick = (event) => {
    setLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
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
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-4 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
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
