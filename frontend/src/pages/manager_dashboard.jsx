import { useEffect, useState } from "react";
import axios from "axios";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

const getAddress = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDKo47VQpTFtD9jXhJH7V8p_7FrcXbJtTs`
    );
    return response.data.results[0]?.formatted_address || "Address not found";
  } catch {
    return "Error fetching address";
  }
};

const ManagerDashboard = ({ manager: propManager }) => {
  const [manager, setManager] = useState(propManager || null);
  const [complaints, setComplaints] = useState([]);
  const [locationAddresses, setLocationAddresses] = useState({});
  const [progressFilter, setProgressFilter] = useState("All");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();
  

  useEffect(() => {
    if (propManager) {
      setManager(propManager);
      return;
    }
    
    const storedManager = localStorage.getItem("manager");
    if (!storedManager) {
      setError("Manager not logged in. Please log in to access the dashboard.");
      navigate("/manager-login");
    } else {
      setManager(JSON.parse(storedManager));
    }
  }, [navigate, propManager]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get("/complaints/area");

      
        const acceptedComplaints = data.filter((complaint) => complaint.status === "accepted");

      
        const addressPromises = acceptedComplaints.map(async (complaint) => {
          const address = await getAddress(complaint.location.lat, complaint.location.lng);
          return { [complaint.complaint_id]: address };
        });

    
        const addresses = await Promise.all(addressPromises);
        const addressMap = addresses.reduce((acc, curr) => ({ ...acc, ...curr }), {});

        setComplaints(acceptedComplaints);
        setLocationAddresses(addressMap);
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
      }
    };

    if (manager) {
      fetchComplaints();
    }
  }, [manager]);

  const updateProgress = async (id, progress) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `http://localhost:5000/api/complaints/${id}/progress`,
        { progress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.complaint_id === id ? { ...complaint, progress: data.progress } : complaint
        )
      );
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("manager");
    navigate("/manager-login");
  };


  const filteredComplaints = complaints.filter((complaint) => {
    if (progressFilter === "All") return true;
    return complaint.progress === progressFilter;
  });

  if (!manager) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
   
    <nav className="flex justify-between items-center bg-gradient-to-r from-blue-800 to-blue-900 p-4 shadow-lg">
      <h1 className="text-2xl font-bold text-white">Area Manager Dashboard</h1>
      <button
        onClick={handleLogout}
        className=" text-white border border-white px-4 py-2  hover:bg-white hover:text-blue-700 transition-colors duration-300 ease-in-out"
      >
        Logout
      </button>
    </nav>
  
 
    <div className="w-full mt-6 px-8 flex justify-end">
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon={faUserCircle} className="text-blue-800 text-4xl" />
        <h1 className="text-xl font-medium text-blue-900">
          Welcome, {manager ? manager.first_name : "Guest"}
        </h1>
      </div>
    </div>
  
    <div className="bg-white mt-6 mx-6 rounded-xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-blue-900">Accepted Complaints</h2>
  
   
      <div className="flex items-center mt-4 mb-6">
        <label htmlFor="progressFilter" className="font-medium text-gray-700 mr-2">
          Filter by Progress:
        </label>
        <select
          id="progressFilter"
          value={progressFilter}
          onChange={(e) => setProgressFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="All">All</option>
          <option value="Recorded">Recorded</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
  
   
      {filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.complaint_id}
              className="bg-gray-50 border rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">
                <h3 className="font-bold text-lg text-blue-900">{complaint.description}</h3>
                <p className="text-sm text-gray-600">Area: {complaint.area}</p>
                <p className="text-sm text-gray-600">
                  Address: {locationAddresses[complaint.complaint_id] || "Loading..."}
                </p>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-sm">
                  Status:{" "}
                  <span
                    className={`${
                      complaint.status.toLowerCase() === "accepted"
                        ? "text-green-600"
                        : complaint.status.toLowerCase() === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </p>
                <p className="font-semibold text-sm">
                  Progress:{" "}
                  <span
                    className={`${
                      complaint.progress === "Resolved"
                        ? "text-blue-600"
                        : complaint.progress === "In Progress"
                        ? "text-orange-600"
                        : complaint.progress === "Not Started"
                        ? "text-gray-600"
                        : "text-black"
                    }`}
                  >
                    {complaint.progress}
                  </span>
                </p>
              </div>
              <div className="mb-4">
                {complaint.image && (
                  <img
                    src={complaint.image}
                    alt="Complaint"
                    className="w-full h-32 object-cover rounded-md shadow-md"
                  />
                )}
              </div>
              <div>
                <select
                  value={complaint.progress}
                  onChange={(e) => updateProgress(complaint.complaint_id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Recorded">Recorded</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-500">No accepted complaints found for your area.</p>
      )}
    </div>
  </div>
  
  );
};

export default ManagerDashboard;
