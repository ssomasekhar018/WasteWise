import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const UserLogin = ({ setUser, setManager }) => {
  // Pre-fill with test admin credentials for easier testing
  const [formData, setFormData] = useState({ 
    email: "admin@example.com", 
    password: "admin123", 
    accountType: "admin" 
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (formData.accountType === "citizen") {
        // Citizen user login
        const { data } = await api.post("/users/login", {
          email: formData.email,
          password: formData.password,
        });
        console.log("Citizen login successful:", data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        navigate("/user_dashboard"); // Redirect to user dashboard
      } else if (formData.accountType === "admin") {
        // Municipal admin login - try user model first with admin role
        try {
          console.log("Attempting admin login with User model:", formData.email);
          console.log("Request payload:", {
            email: formData.email,
            password: formData.password,
          });
          const response = await api.post("/users/login", {
            email: formData.email,
            password: formData.password,
          });
          
          const data = response.data;
          console.log("User login response:", data);
          console.log("Response headers:", response.headers);
          console.log("Response status:", response.status);
          
          if (data.role === "admin") {
            console.log("Admin login successful, storing data and redirecting");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            setUser(data);
            navigate("/complaints"); // Redirect to admin dashboard
          } else {
            // If user exists but is not admin, show error
            console.log("User exists but is not admin:", data.role);
            setError("This account does not have admin privileges");
          }
        } catch (userErr) {
          console.log("User model login failed:", userErr.message);
          console.log("Error response:", userErr.response?.data);
          console.log("Error status:", userErr.response?.status);
          
          // If user login fails, try area manager login as fallback
          try {
            console.log("Trying area manager login");
            const { data } = await api.post("/area-managers/manager-login", {
              email: formData.email,
              password: formData.password,
            });
            console.log("Area manager login response:", data);
            localStorage.setItem("token", data.token);
            localStorage.setItem("manager", JSON.stringify(data.manager)); // Store as manager
            setManager(data.manager);
            navigate("/manager-dashboard"); // Redirect to manager dashboard
          } catch (managerErr) {
            console.error("Admin login failed - User error:", userErr.message);
            console.error("Admin login failed - Manager error:", managerErr.message);
            setError("Invalid admin credentials. Please check your email and password.");
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-100">
      <div className="bg-green-50 p-8 rounded-lg shadow-lg w-96 border border-green-300">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l focus:outline-none ${activeTab === "signin" ? "bg-green-200 text-green-700" : "bg-green-50 text-green-600 border-r border-green-300"}`}
            onClick={() => setActiveTab("signin")}
            disabled
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-r focus:outline-none ${activeTab === "signup" ? "bg-green-200 text-green-700" : "bg-green-50 text-green-600"}`}
            onClick={() => { setActiveTab("signup"); navigate("/signup"); }}
          >
            Sign Up
          </button>
        </div>
        <h2 className="text-2xl text-center font-bold mb-4 text-green-600">Sign In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-green-700 mb-1">Account Type</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="w-full p-2 border border-green-500 rounded"
            >
              <option value="citizen">Citizen User</option>
              <option value="admin">Municipal Admin</option>
            </select>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-3 border border-green-500 focus:border-green-700 focus:ring focus:ring-green-200 rounded outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mb-4 border border-green-500 focus:border-green-700 focus:ring focus:ring-green-200 rounded outline-none"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded w-full shadow-md hover:from-green-500 hover:to-green-700 transition-all"
          >
            Sign In
          </button>
        </form>
        <div className="text-center mt-4">
          <span>Don't have an account? </span>
          <a href="/signup" className="text-green-700 hover:underline">Sign Up</a>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;