
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  ClipboardList, 
  UsersRound, 
  LayoutDashboard, 
  Settings 
} from 'lucide-react';
import HamburgerToggle from "../components/HamburgerToggle";


const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "http://localhost:5000/api/users/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        // Optionally handle error
      }
    }
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <HamburgerToggle isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div 
        className={`sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 h-full bg-gradient-to-b from-green-800 to-green-900 text-white fixed top-0 left-0 shadow-2xl z-40 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-green-700">
          <h1 className="text-2xl font-bold text-center text-white uppercase tracking-wider">
            WasteWise
          </h1>
        </div>
      
      <ul className="space-y-2 p-4">
        {[
          { 
            to: "/analytics", 
            icon: LayoutDashboard, 
            label: "Dashboard" 
          },
          { 
            to: "/complaints", 
            icon: ClipboardList, 
            label: "Complaints" 
          },
          { 
            to: "/manage-area-managers", 
            icon: UsersRound, 
            label: "Area Managers" 
          },
          { 
            to: "/settings", 
            icon: Settings, 
            label: "Settings" 
          }
        ].map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `
                flex items-center p-3 rounded-lg 
                transition-all duration-300 
                ${isActive 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'hover:bg-green-700 hover:translate-x-1 text-green-200'
                }
              `}
            >
              <Icon className="mr-3" size={20} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-green-700 mt-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </div>

    </>
  );
};

export default Sidebar;
