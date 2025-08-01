import { useEffect, useState } from "react";
import axios from "axios";
import ComplaintForm from "./ComplaintForm";
import { Link, useNavigate } from "react-router-dom";
import userHome from "../images/user_home.jpg";
import image1 from "../images/image1.jpg";
import image2 from "../images/image2.jpg";
import image3 from "../images/image3.jpg";
import image4 from "../images/image4.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';



const UserDashboard = ({ user: propUser }) => {
  // Remove the effect that logs out users on first load
     useEffect(() => {
       localStorage.removeItem("token");
       localStorage.removeItem("user");
     }, []);
  const [user, setUser] = useState(propUser || null);
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "https://wastewise-management.onrender.com/api/users/logout",
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
  const [error, setError] = useState("");
  // Initialize showLoginPrompt based on whether user is logged in
  const [showLoginPrompt, setShowLoginPrompt] = useState(!localStorage.getItem("token"));

  const [open, setOpen] = useState(null);


  const faqData = [
    {
      question: 'What is WasteWise?',
      answer: 'WasteWise is a waste management service initiated by the India Municipal Corporation. We are dedicated to making India a cleaner, greener, and more sustainable country by providing efficient waste collection and disposal services.',
    },
    {
      question: 'What areas are covered by WasteWise?',
      answer: 'WasteWise provides waste management services to all local authorities within the India by Respective Municipal Corporation.',
    },
    {
      question: 'How do I submit a complaint?',
      answer: 'To submit a complaint, go to the "Submit Your Complaint" section and Follow the provided steps',
    },
    {
      question: 'What are WasteWise goals?',
      answer: 'Improve the cleanliness and environmental health of India and Promote sustainable waste management practices',
    },


  ];

  const toggleAnswer = (index) => {
    setOpen(open === index ? null : index);
  };


  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (propUser) {
          setUser(propUser);
          return;
        }
        
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }
        
        const token = localStorage.getItem("token");
        if (!token) {
          setShowLoginPrompt(true);
          setError("No token found. Please log in.");
          // Removed automatic redirect to login
          return;
        }

        const { data } = await axios.get("https://wastewise-management.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data);
      } catch (err) {
        setShowLoginPrompt(true);
        setError(err.response?.data?.message || "Failed to fetch user data.");
        // Removed automatic redirect to login on error
      }
    };

    fetchUser();
  }, [navigate, propUser]);

  useEffect(() => {
  if (!user) return;
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("https://wastewise-management.onrender.com/api/complaints/my-complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(data);
    } catch (err) {
      setComplaints([]);
    }
  };
  fetchComplaints();
}, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <nav className="bg-white p-4 w-full fixed top-0 left-0 z-50 shadow-md">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1
            className="text-3xl font-black tracking-wider text-transparent bg-clip-text uppercase bg-gradient-to-r from-green-500 to-green-900 drop-shadow-md"
            style={{
              fontFamily: 'YourCustomFont, sans-serif',
              WebkitBackgroundClip: 'text',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            WasteWise
          </h1>

          <div className="flex items-center space-x-6">
            {[
              { to: "/view-complaints", label: "My Complaints", id: "complaints", isExternal: true },
              { to: "#about", label: "About Us", id: "about", isExternal: false },
              { to: "#faq", label: "FAQ", id: "faq", isExternal: false },
              { to: "#contact", label: "Contact Us", id: "contact", isExternal: false }
            ].map(({ to, label, id, isExternal }) => (
              isExternal ? (
                <Link
                  key={id}
                  to={to}
                  className="relative group text-green-800 px-4 py-2 rounded-sm transition-all duration-300"
                >
                  <span className="relative z-10">{label}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              ) : (
                <a
                  key={id}
                  href={to}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(to).scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="relative group text-green-800 px-4 py-2 rounded-sm transition-all duration-300 cursor-pointer"
                >
                  <span className="relative z-10">{label}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              )
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-all duration-300"
              >
                Login/Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>




      <header
        className="relative bg-cover bg-center text-white text-center h-screen"
        style={{
          backgroundImage: `url(${userHome}), url(/path-to-secondary-image.jpg)`,
          backgroundSize: "cover, contain",
          backgroundPosition: "center, center",
        }}
      >

        <div className="absolute inset-0 bg-gradient-to-t from-green-700 to-transparent"></div>


        <div className="relative z-10 flex flex-col justify-center items-center h-full">
          <h1 className="text-4xl md:text-5xl font-bold animate__animated animate__fadeIn">
            Welcome to WasteWise
          </h1>
          <p className="mt-4 text-lg md:text-2xl animate__animated animate__fadeIn animate__delay-1s">
            Report.Resolve.Revive
          </p>
          <p className="mt-4 text-lg md:text-xl animate__animated animate__fadeIn animate__delay-1s">
            Together, let’s create a cleaner and greener country for everyone!
          </p>
          {/* Always show Login/Sign Up button in header */}
          {!user && (
            <div className="mt-8">
              <Link
                to="/login"
                className="px-6 py-2 border border-white text-white rounded-md hover:bg-white hover:text-green-800"
              >
                Login/Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>







      <div className="flex flex-col justify-start items-start flex-grow">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="bg-white p-6 rounded shadow-md w-full">
          {user ? (
            <>
              <h2 className="text-3xl font-semibold text-green-700 text-center tracking-widest uppercase mt-8">
                Welcome to Your Dashboard
              </h2>
              <div className="text-center mt-4 mb-8">
                <p className="text-lg text-gray-700">Hello, {user.username}! You are logged in as a {user.role}.</p>
              </div>
              {/* Add ComplaintForm component for logged-in users */}
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-green-700 text-center tracking-widest uppercase mt-8 mb-4">Submit Your Complaint</h2>
                <ComplaintForm user={user} />
              </div>
              
              <h2 className="text-2xl font-semibold text-green-700 text-center mt-8 mb-4">My Complaints</h2>
              {complaints.length === 0 ? (
                <p className="text-gray-600 text-center">You have not submitted any complaints yet.</p>
              ) : (
                <ul>
                  {complaints.map((complaint) => (
                    <li key={complaint._id} className="mb-2 p-2 border rounded">
                      <strong>{complaint.description}</strong> - Status: {complaint.status}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="text-center p-8 bg-green-50 border-2 border-green-200 rounded-lg">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Please log in to access your dashboard</h2>
              <p className="text-gray-600 mb-4">You need to be logged in to view your dashboard and submit complaints.</p>
              <Link to="/login" className="px-6 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 font-medium text-lg">Login Now</Link>
            </div>
          )}
        </div>
      </div>

      <section id="about" className="bg-white py-16">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 gap-x-24">


            <div className="flex-1">
              <h2 className="text-3xl font-semibold  text-green-700 text-center tracking-widest uppercase mt-8 mb-8">About Us</h2>
              <p className="text-lg text-gray-600 mb-6">
                WasteWise is a leading waste management service dedicated to transforming India into a cleaner, greener, and
                more sustainable country. We are a municipal corporations initiative born from a deep commitment to environmental cleanliness..
              </p>
              <p className="text-lg text-gray-600">
                Our mission is to empower the community by promoting environmental awareness and
                fostering a strong sense of collective responsibility in the fight against pollution.
                We believe that through collaborative efforts, we can achieve significant positive change and
                contribute to the well-being of our planet.
              </p>
            </div>


            <div className="flex-1 grid grid-cols-2 gap-8">

              <div className="w-full h-64 bg-gray-300 rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                <img
                  src={image1}
                  alt="Image 1"
                  className="w-full h-full object-cover"
                />
              </div>


              <div className="w-full h-64 bg-gray-300 rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                <img
                  src={image2}
                  alt="Image 2"
                  className="w-full h-full object-cover"
                />
              </div>


              <div className="w-full h-64 bg-gray-300 rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                <img
                  src={image3}
                  alt="Image 3"
                  className="w-full h-full object-cover"
                />
              </div>


              <div className="w-full h-64 bg-gray-300 rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                <img
                  src={image4}
                  alt="Image 4"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="faq" className="bg-white py-16">
        <div className="max-w-screen-md mx-auto px-6">
          <h1 className="text-3xl font-semibold text-green-700 text-center tracking-widest uppercase mb-6">
            Frequently Asked Questions
          </h1>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div className="bg-white rounded-lg shadow-md p-4" key={index}>
                <button
                  className="w-full text-left text-lg font-semibold text-gray-800 hover:text-green-600 focus:outline-none flex justify-between items-center"
                  onClick={() => toggleAnswer(index)}
                >
                  <span>{faq.question}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`w-5 h-5 transform transition-transform ${open === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`mt-2 text-base text-gray-600 overflow-hidden transition-all duration-300 ease-in-out ${open === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>




      <footer id="contact" className="bg-green-900 text-white py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">

                <span>Wastewise@gmail.com</span>
              </div>
              <div className="flex items-center">

                <span>SRM University, Mangalagiri</span>
              </div>
              <div className="flex items-center">

                <span>Andhra Pradesh, India</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">Home</a></li>
              <li><a href="#" className="hover:text-gray-300">About Us</a></li>
              <li><a href="#" className="hover:text-gray-300">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-300">Facebook</a>
              <a href="#" className="hover:text-gray-300">Twitter</a>
              <a href="#" className="hover:text-gray-300">Instagram</a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-4 border-t border-gray-700">
          <p>&copy; 2025 WasteWise. All Rights Reserved.</p>
        </div>
      </footer>


    </div>

  );
};

export default UserDashboard;
