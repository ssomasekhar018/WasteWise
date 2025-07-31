import { useEffect, useState } from "react";
import axios from "axios";
import { LoadScriptNext } from "@react-google-maps/api";
import Sidebar from "../pages/Sidebar";

const Complaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [locationAddresses, setLocationAddresses] = useState({});
  const [activeTable, setActiveTable] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const rowsPerPage = 5;

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

  // Update sidebar state when it changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('.sidebar');
      setIsSidebarOpen(sidebarElement ? !sidebarElement.classList.contains('-translate-x-full') : true);
    };
    
    // Check initially after a short delay to ensure DOM is ready
    const timer = setTimeout(checkSidebarState, 500);
    
    // Set up a mutation observer to watch for sidebar class changes
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get("http://localhost:5000/api/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Set complaints immediately to show data faster
        setComplaints(data);
        
        // Fetch addresses in batches to improve performance
        const batchSize = 5;
        const addressMap = {};
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          const batchPromises = batch.map(async (complaint) => {
            const address = await getAddress(complaint.location.lat, complaint.location.lng);
            return { [complaint.complaint_id]: address };
          });
          
          const batchAddresses = await Promise.all(batchPromises);
          batchAddresses.forEach(addr => {
            Object.assign(addressMap, addr);
          });
          
          // Update addresses after each batch
          setLocationAddresses(prev => ({ ...prev, ...addressMap }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.complaint_id === id ? { ...complaint, status: data.status } : complaint
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const pendingComplaints = complaints.filter((c) => c.status === "pending");
  const acceptedComplaints = complaints.filter((c) => c.status === "accepted");
  const rejectedComplaints = complaints.filter((c) => c.status === "rejected");

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginatedComplaints = (complaintsArray) => {
    const totalPages = Math.ceil(complaintsArray.length / rowsPerPage);
    return {
      complaints: complaintsArray.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
      totalPages: totalPages || 1 // Ensure at least 1 page even if no complaints
    };
  };

  const renderTable = (title, complaintsToRender) => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-4 text-left border-b">Username</th>
              <th className="p-4 text-left border-b">Email</th>
              <th className="p-4 text-left border-b">Description</th>
              <th className="p-4 text-left border-b">Address</th>
              <th className="p-4 text-left border-b">Area</th>
              <th className="p-4 text-left border-b">Image</th>
              <th className="p-4 text-left border-b">Status</th>
              {title !== "Rejected Complaints" && (
                <th className="p-4 text-left border-b">Progress</th>
              )}
              {title === "Pending Complaints" && (
                <th className="p-4 text-left border-b">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {complaintsToRender.map((complaint) => (
              <tr
                key={complaint.complaint_id}
                className="hover:bg-gray-100 transition duration-300 ease-in-out"
              >
                <td className="p-4 border-b text-gray-800">{complaint.username}</td>
                <td className="p-4 border-b text-gray-800">{complaint.email}</td>
                <td className="p-4 border-b text-gray-800">{complaint.description}</td>
                <td className="p-4 border-b text-gray-800">
                  {locationAddresses[complaint.complaint_id] || "Loading..."}
                </td>
                <td className="p-4 border-b text-gray-800">{complaint.area || "N/A"}</td>
                <td className="p-4 border-b">
                  {complaint.image && (
                    <img
                      src={complaint.image}
                      alt="Complaint"
                      className="w-16 h-16 object-cover rounded-md shadow-md"
                    />
                  )}
                </td>
                <td className="p-4 border-b text-gray-800">{complaint.status}</td>
                {title !== "Rejected Complaints" && (
                  <td className="p-4 border-b text-gray-800">
                    {complaint.progress || "Recorded"}
                  </td>
                )}
                {title === "Pending Complaints" && (
                  <td className="p-4 border-b text-gray-800">
                    <button
                      onClick={() => updateStatus(complaint.complaint_id, "accepted")}
                      className="bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 transition duration-300"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(complaint.complaint_id, "rejected")}
                      className="bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-700 transition duration-300 ml-2"
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-center">
          {Array.from({ length: getPaginatedComplaints(complaintsToRender).totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-6 bg-white`}>
        <div className="min-h-screen">
          {/* Fixed buttons at the top */}
          <div className="fixed top-8 left-0 right-0 z-10 py-2 flex justify-center space-x-4">
            <button
              onClick={() => setActiveTable("pending")}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${activeTable === "pending" ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              Pending Complaints
            </button>
            <button
              onClick={() => setActiveTable("accepted")}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${activeTable === "accepted" ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              Accepted Complaints
            </button>
            <button
              onClick={() => setActiveTable("rejected")}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${activeTable === "rejected" ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              Rejected Complaints
            </button>
          </div>

          <div className="pt-24 min-h-screen">
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
                <p className="ml-4 text-lg text-gray-600">Loading complaints...</p>
              </div>
            ) : (
              <LoadScriptNext googleMapsApiKey="AIzaSyDKo47VQpTFtD9jXhJH7V8p_7FrcXbJtTs" loadingElement={<div>Loading Maps...</div>}>
                {activeTable === "pending" && renderTable("Pending Complaints", getPaginatedComplaints(pendingComplaints).complaints)}
                {activeTable === "accepted" && renderTable("Accepted Complaints", getPaginatedComplaints(acceptedComplaints).complaints)}
                {activeTable === "rejected" && renderTable("Rejected Complaints", getPaginatedComplaints(rejectedComplaints).complaints)}
              </LoadScriptNext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
