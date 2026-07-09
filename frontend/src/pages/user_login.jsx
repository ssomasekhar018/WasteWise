import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../utils/api";

const UserLogin = ({ setUser, setManager }) => {
  // Pre-fill with test admin credentials for easier testing
  const [formData, setFormData] = useState({ 
    email: "user@example.com", 
    password: "user123", 
    accountType: "citizen" 
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "accountType") {
      setFormData({
        ...formData,
        accountType: value,
        email: value === "citizen" ? "user@example.com" : "admin@example.com",
        password: value === "citizen" ? "user123" : "admin123",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log('Login attempt for:', formData.accountType, 'with email:', formData.email);
    try {
      if (formData.accountType === "citizen") {
        // Citizen user login
        console.log('Attempting citizen login...');
        const { data } = await api.post("/users/login", {
          email: formData.email,
          password: formData.password,
        });
        console.log("Citizen login successful:", data);
        
        // Store token and user data in localStorage
        if (data && data.token) {
          console.log("Storing token in localStorage:", data.token.substring(0, 10) + '...');
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data));
          setUser(data);
          navigate("/user_dashboard"); // Redirect to user dashboard
        } else {
          console.error("Login response missing token:", data);
          setError("Login failed: Invalid response from server");
        }
      } else if (formData.accountType === "admin") {
        // Municipal admin login - try user model first with admin role
        console.log('Attempting admin login...');
        try {
          console.log("Trying user login with admin role...");
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
            if (data && data.token) {
              console.log("Storing admin token in localStorage:", data.token.substring(0, 10) + '...');
              localStorage.setItem("token", data.token);
              localStorage.setItem("user", JSON.stringify(data));
              setUser(data);
              navigate("/complaints"); // Redirect to admin dashboard
            } else {
              console.error("Admin login response missing token:", data);
              setError("Login failed: Invalid response from server");
            }
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
          console.log('User login failed or not admin, trying area manager login...');
          try {
            console.log("Trying area manager login");
            const { data } = await api.post("/area-managers/manager-login", {
              email: formData.email,
              password: formData.password,
            });
            console.log("Area manager login response:", data);
            if (data && data.token) {
              console.log("Storing manager token in localStorage:", data.token.substring(0, 10) + '...');
              localStorage.setItem("token", data.token);
              localStorage.setItem("manager", JSON.stringify(data.manager)); // Store as manager
              setManager(data.manager);
              navigate("/manager-dashboard"); // Redirect to manager dashboard
            } else {
              console.error("Manager login response missing token:", data);
              setError("Login failed: Invalid response from server");
            }
          } catch (managerErr) {
            console.error("Admin login failed - User error:", userErr.message);
            console.error("Admin login failed - Manager error:", managerErr.message);
            console.error("Manager error response:", managerErr.response?.data);
            console.error("Manager error status:", managerErr.response?.status);
            
            // Provide more specific error message based on the error status
            if (managerErr.response?.status === 401) {
              setError("Invalid admin credentials. Please check your email and password.");
            } else if (managerErr.response?.status === 500) {
              setError("Server error. Please try again later or contact support.");
            } else {
              setError(managerErr.response?.data?.message || "Login failed. Please try again.");
            }
          }
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Provide more specific error message based on the error status
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please check your email and password.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later or contact support.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
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
            placeholder={formData.accountType === "citizen" ? "user@example.com" : "admin@example.com"}
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-3 border border-green-500 focus:border-green-700 focus:ring focus:ring-green-200 rounded outline-none"
            required
          />
          <div className="relative mb-4 w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 pr-10 border border-green-500 focus:border-green-700 focus:ring focus:ring-green-200 rounded outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-900"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
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