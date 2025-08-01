import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

const ViewComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress) => {
    const numProgress = parseInt(progress);
    if (numProgress < 25) return "bg-red-100 text-red-800";
    if (numProgress < 50) return "bg-yellow-100 text-yellow-800";
    if (numProgress < 75) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get(
          "/complaints/my-complaints"
        );

        setComplaints(response.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.response?.data?.message || "Failed to fetch complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) {
    return <p>Loading complaints...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }


  const acceptedComplaints = complaints.filter(
    (complaint) => complaint.status.toLowerCase() === "accepted"
  );
  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status.toLowerCase() === "pending"
  );

  const renderTable = (title, complaints, includeProgress) => (
    <>
      <h2 className="text-2xl font-bold text-left text-green-800 mt-16 uppercase">
        {title}
      </h2>
      {complaints.length === 0 ? (
        <p className="text-lg text-gray-600">No {title.toLowerCase()} complaints found.</p>
      ) : (
        <table className="min-w-full table-auto border-separate border-spacing-2 rounded-lg shadow-lg bg-white border border-gray-200 mt-4">
          <thead>
            <tr className="bg-green-800 text-white">
              <th
                className="py-4 px-6 text-sm font-bold tracking-wider uppercase border-b border-green-600 text-center"
              >
                Description
              </th>
              <th
                className="py-4 px-6 text-sm font-bold tracking-wider uppercase border-b border-green-600 text-center"
              >
                Area
              </th>
              <th
                className="py-4 px-6 text-sm font-bold tracking-wider uppercase border-b border-green-600 text-center"
              >
                Status
              </th>
              {includeProgress && (
                <th
                  className="py-4 px-6 text-sm font-bold tracking-wider uppercase border-b border-green-600 text-center"
                >
                  Progress
                </th>
              )}
              <th
                className="py-4 px-6 text-sm font-bold tracking-wider uppercase border-b border-green-600 text-center"
              >
                Image
              </th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr
                key={complaint._id}
                className="hover:bg-gray-50 transition-colors duration-300 text-lg text-center border-t border-gray-300"
              >
                <td className="py-4 px-6 border-b border-gray-300 font-medium">
                  {complaint.description}
                </td>
                <td className="py-4 px-6 border-b border-gray-300">{complaint.area}</td>
                <td className="py-4 px-6 border-b border-gray-300">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>
                </td>
                {includeProgress && (
                  <td className="py-4 px-6 border-b border-gray-300">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getProgressColor(
                        complaint.progress
                      )}`}
                    >
                      {complaint.progress}
                    </span>
                  </td>
                )}
                <td className="py-4 px-6 flex justify-center items-center border-b border-gray-300">
                  {complaint.image && (
                    <img
                      src={complaint.image}
                      alt="Complaint"
                      className="w-16 h-16 object-cover rounded-md shadow-md transition-transform duration-300 transform hover:scale-110 cursor-pointer"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="bg-white p-4 w-full fixed top-0 left-0 z-50 shadow-md">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1
            className="text-3xl font-black tracking-wider text-transparent bg-clip-text uppercase bg-gradient-to-r from-green-500 to-green-900 drop-shadow-md"
            style={{
              WebkitBackgroundClip: "text",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            WasteWise
          </h1>
  
          <div className="flex items-center space-x-6">
            {[
              { to: "/user_dashboard", label: "Submit a Complaint" },
              { to: "/", label: "About Us" },
              { to: "/", label: "FAQ" },
              { to: "/", label: "Contact Us" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative group text-green-800 px-4 py-2 rounded-sm transition-all duration-300"
              >
                <span className="relative z-10">{label}</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
  
      <div className="container mx-auto px-4 py-8">
        {renderTable("Accepted Complaints", acceptedComplaints, true)}
        {renderTable("Pending Complaints", pendingComplaints, false)}
      </div>
    </div>
  );
  
};

export default ViewComplaints;
