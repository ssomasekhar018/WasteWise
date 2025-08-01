import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const UserSignup = () => {
  const [formData, setFormData] = useState({
    accountType: "citizen",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    NIC_no: "",
    first_name: "",
    last_name: "",
    area: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      if (formData.accountType === "citizen") {
        await api.post("/users/signup", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        navigate("/login");
      } else if (formData.accountType === "admin") {
        await api.post("/area-managers", {
          NIC_no: formData.NIC_no,
          first_name: formData.first_name,
          last_name: formData.last_name,
          area: formData.area,
          email: formData.email,
          password: formData.password,
        });
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-100">
      <div className="bg-green-50 p-8 rounded-lg shadow-lg w-96 border border-green-300">
        <h2 className="text-2xl text-center font-bold mb-4 text-green-600">Sign Up</h2>
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
          {formData.accountType === "citizen" && (
            <>
              <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-green-500 rounded"
                required
              />
            </>
          )}
          {formData.accountType === "admin" && (
            <>
              <input
                name="NIC_no"
                placeholder="NIC Number"
                value={formData.NIC_no}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="area"
                placeholder="Area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 mb-3 border border-green-500 rounded"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 mb-4 border border-green-500 rounded"
                required
              />
            </>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded w-full shadow-md hover:from-green-500 hover:to-green-700 transition-all"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4">
          <span>Already have an account? </span>
          <a href="/login" className="text-green-700 hover:underline">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;