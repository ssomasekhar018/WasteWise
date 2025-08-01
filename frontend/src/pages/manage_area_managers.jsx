import { useState, useEffect } from "react";
import api from "../utils/api";
import Sidebar from "../pages/Sidebar";


const ManageAreaManagers = ({ manager }) => {
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    NIC_no: "",
    first_name: "",
    last_name: "",
    area: "",
    email: "",
    password: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const { data } = await api.get("/area-managers");
        setManagers(data);
      } catch {
        setError("Failed to fetch area managers.");
      }
    };

    fetchManagers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await api.put(`/area-managers/${formData.NIC_no}`, formData);
        setSuccessMessage("Area manager updated successfully!");
      } else {
        await api.post("/area-managers", formData);
        setSuccessMessage("Area manager added successfully!");
      }
      setEditMode(false);
      setFormData({
        NIC_no: "",
        first_name: "",
        last_name: "",
        area: "",
        email: "",
        password: "",
      });
    } catch {
      setError("Failed to submit the form.");
    }
  };

  const handleDelete = async (NIC_no) => {
    try {
      await api.delete(`/area-managers/${NIC_no}`);
      setManagers(managers.filter((manager) => manager.NIC_no !== NIC_no));
      setSuccessMessage("Area manager deleted successfully!");
    } catch {
      setError("Failed to delete area manager.");
    }
  };

  const handleEdit = (manager) => {
    setFormData(manager);
    setEditMode(true);
  };

  // Get sidebar state
  const getSidebarState = () => {
    const sidebarElement = document.querySelector('.sidebar');
    return sidebarElement ? !sidebarElement.classList.contains('-translate-x-full') : true;
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Update sidebar state when it changes
  useEffect(() => {
    const checkSidebarState = () => {
      setIsSidebarOpen(getSidebarState());
    };
    
    // Check initially
    checkSidebarState();
    
    // Set up a mutation observer to watch for sidebar class changes
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex">
 
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-8 bg-white`}>
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Manage Area Managers</h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="NIC_no"
              placeholder="NIC Number"
              value={formData.NIC_no}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="area"
              placeholder="Area"
              value={formData.area}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white p-4 w-48 rounded-md mt-4 hover:bg-green-700 transition-colors"
          >
            {editMode ? "Update" : "Add"} Area Manager
          </button>
        </form>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-16">Area Managers</h2>

        {/* Table */}
        <table className="min-w-full bg-white shadow-lg rounded-lg border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-gray-600">NIC Number</th>
              <th className="px-6 py-4 text-left text-gray-600">Name</th>
              <th className="px-6 py-4 text-left text-gray-600">Area</th>
              <th className="px-6 py-4 text-left text-gray-600">Email</th>
              <th className="px-6 py-4 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager) => (
              <tr
                key={manager.NIC_no}
                className="hover:bg-gray-100 transition duration-300 ease-in-out"
              >
                <td className="px-6 py-4 border-b text-gray-800">{manager.NIC_no}</td>
                <td className="px-6 py-4 border-b text-gray-800">
                  {manager.first_name} {manager.last_name}
                </td>
                <td className="px-6 py-4 border-b text-gray-800">{manager.area}</td>
                <td className="px-6 py-4 border-b text-gray-800">{manager.email}</td>
                <td className="px-6 py-4 border-b flex space-x-2">
                  <button
                    onClick={() => handleEdit(manager)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(manager.NIC_no)}
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

  );
};

export default ManageAreaManagers;
