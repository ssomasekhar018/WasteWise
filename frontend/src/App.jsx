import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserSignup from "./pages/user_signup";
import UserLogin from "./pages/user_login";
import UserDashboard from "./pages/user_dashboard";
import Complaints from "./pages/Complaints";
import ComplaintForm from "./pages/ComplaintForm";
import ManageAreaManagers from "./pages/manage_area_managers";
import AreaManagerLogin from "./pages/area_manager_login";
import ManagerDashboard from "./pages/manager_dashboard";
import ViewComplaint from "./pages/view_complaints";
import Analytics from "./pages/analytics";

function App() {
  const [user, setUser] = useState(null);
  const [manager, setManager] = useState(null);

  useEffect(() => {
    // Standardize localStorage usage
    try {
      const storedUser = localStorage.getItem("user");
      const storedManager = localStorage.getItem("manager");
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedManager) setManager(JSON.parse(storedManager));
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
      // Clear potentially corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("manager");
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserDashboard user={user} />} />
        <Route path="/signup" element={<UserSignup />} /> 
        <Route path="/login" element={<UserLogin setUser={setUser} setManager={setManager} />} /> 
        <Route path="/user_dashboard" element={<UserDashboard user={user} />} />
        <Route path="/dashboard" element={<UserDashboard user={user} />} /> 
        <Route path="/complaints" element={<Complaints user={user} />} /> 
        {/* Redirect from complaints-form to user dashboard */}
        <Route path="/complaints-form" element={<Navigate to="/user_dashboard" replace />} /> 
        <Route path="/view-complaints" element={<ViewComplaint user={user} />} /> 
        
        <Route path="/manage-area-managers" element={<ManageAreaManagers manager={manager} />} /> 
        <Route path="/manager-dashboard" element={<ManagerDashboard manager={manager} />} /> 
        <Route path="/manager-login" element={<AreaManagerLogin setManager={setManager} />} /> 
        <Route path="/analytics" element={<Analytics manager={manager} />} /> 
      </Routes>
    </Router>
  );
}

export default App;
