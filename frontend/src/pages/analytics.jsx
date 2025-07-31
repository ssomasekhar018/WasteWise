import { useEffect, useState } from "react";
import Sidebar from "../pages/Sidebar";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from "chart.js";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
);

const Analytics = ({ manager }) => {
  const [barChartData, setBarChartData] = useState(null); // state for Bar chart
  const [pieChartData, setPieChartData] = useState(null); //state for Pie chart
  const [progressData, setProgressData] = useState(null);


  // Fetch data for Bar chart (Complaints by Area)
  useEffect(() => {
    const fetchComplaintsData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/analytics/complaints-by-area-detailed"
        );
        const data = response.data;

        const areas = data.map((item) => item._id || "Unknown");
        const totalComplaints = data.map((item) => item.totalComplaints);

        setBarChartData({
          labels: areas,
          datasets: [
            {
              label: "Total Complaints",
              data: totalComplaints,
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Green
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching detailed complaints by area:", err);
      }
    };

    fetchComplaintsData();
  }, []);

  // Fetch data for Pie chart (Complaints by Status)
  useEffect(() => {
    const fetchComplaintsByStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/analytics/complaints-by-status"
        );
        const data = response.data;

        const statusLabels = data.map((item) => item._id || "Unknown");
        const statusCounts = data.map((item) => item.count);

        setPieChartData({
          labels: statusLabels,
          datasets: [
            {
              data: statusCounts,
              backgroundColor: ["#4caf50", "#ffeb3b", "#f44336"], // Green, Yellow, Red
              hoverBackgroundColor: ["#388e3c", "#fbc02d", "#d32f2f"],
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching complaints by status:", err);
      }
    };

    fetchComplaintsByStatus();
  }, []);




  useEffect(() => {
    const fetchComplaintsByProgress = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/analytics/complaints-by-progress"
        );
        const data = response.data;

        const progressLabels = data.map((item) => item._id || "Unknown");
        const progressCounts = data.map((item) => item.count);

        setProgressData({
          labels: progressLabels,
          datasets: [
            {
              data: progressCounts,
              backgroundColor: ["#4caf50", "#ffeb3b", "#f44336"], // Green, Yellow, Red
              hoverBackgroundColor: ["#388e3c", "#fbc02d", "#d32f2f"],
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching complaints by progress:", err);
      }
    };

    fetchComplaintsByProgress();
  }, []);


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
    <div className="bg-white min-h-screen p-6">
      <Sidebar></Sidebar>
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-8 bg-white`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Complaints by Area (Detailed)</h2>
            <div className="h-80">
              {barChartData ? (
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: true, text: "Complaints by Area" },
                    },
                    scales: {
                      x: { title: { display: true, text: "Areas" } },
                      y: { title: { display: true, text: "Number of Complaints" }, beginAtZero: true },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Complaints by Resolution Status</h2>
            <div className="h-80">
              {pieChartData ? (
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: { display: true, text: "Complaints Breakdown by Resolution Status" },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
              )}
            </div>
          </div>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Complaints by Progress
          </h2>
          <div className="h-80">
            {progressData ? (
              <Pie
                data={progressData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Complaints Breakdown by Progress Status",
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart...
              </div>

            )}
          </div>
        </div>
      </div>




    </div>

  );
};

export default Analytics;
