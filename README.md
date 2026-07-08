<!-- Banner -->
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&pause=1000&color=10B981&center=true&vCenter=true&width=600&lines=WasteWise+Garbage+Management+System;Smart+Waste+Management+Platform;MERN+Stack+Application" alt="Typing SVG"/>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
</p>

---

# 🌍 WasteWise - Garbage Management System

A comprehensive **MERN stack-based waste management platform** that connects citizens, municipal authorities, and area managers to efficiently handle garbage-related issues. Features real-time complaint tracking, interactive maps, analytics dashboard, and responsive design for seamless waste management operations.

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user and manager login system
- 📱 **Complaint Submission** - Users can report issues with images and precise locations
- 🗺️ **Interactive Maps** - Google Maps integration for location selection
- 📊 **Admin Dashboard** - Comprehensive complaint management interface
- 👥 **Area Manager Assignment** - Automatic complaint routing to relevant managers
- 📈 **Progress Tracking** - Real-time status updates and progress monitoring
- 📊 **Analytics Dashboard** - Visual representation of complaint statistics
- 📱 **Responsive Design** - Mobile-friendly interface using TailwindCSS
- 🔄 **Real-time Updates** - Live tracking of complaint status and progress

---

## 🖥️ Live Demo

> [🌐 View Application Live](https://wastewise-1-v9qh.onrender.com)

---

## 📸 Screenshots

<p align="center">
  <img src="" width="80%"/>
  <img src=""/>
  <img src="" width="80%"/>
</p>

---

## 🛠️ Tech Stack

- **Frontend:** React.js, TailwindCSS, Vite, Chart.js, Google Maps API
- **Backend:** Node.js, Express.js, JWT Authentication
- **Database:** MongoDB with Mongoose ODM
- **File Upload:** Multer for image handling
- **Deployment:** Render.com, MongoDB Atlas
- **Additional:** Axios, React Router, SweetAlert2

---

## 🧩 System Architecture

The WasteWise Garbage Management System follows a three-tier architecture:

1. **Presentation Layer (Frontend):**
   - React.js with Vite for fast development
   - TailwindCSS for responsive UI components
   - Chart.js for analytics visualization
   - Google Maps API for location services

2. **Application Layer (Backend):**
   - Node.js and Express.js for RESTful API services
   - JWT for secure authentication and authorization
   - Multer middleware for file uploads
   - Custom middleware for request validation

3. **Data Layer (Database):**
   - MongoDB Atlas for cloud database storage
   - Mongoose ODM for data modeling and validation
   - Efficient data schemas for complaints, users, and area managers

```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/area-managers/manager-login` - Manager login

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Submit complaint
- `PUT /api/complaints/:id/status` - Update status

### Analytics
- `GET /api/analytics/complaints-by-status` - Status analytics
- `GET /api/analytics/complaints-by-area-detailed` - Area-based analytics
- `GET /api/analytics/complaints-by-progress` - Progress analytics

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Google Maps API key

### Environment Setup

1. **Backend Environment Variables**
   Create `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wastewise
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   PORT=5000
   NODE_ENV=production
   ```

2. **Frontend Environment Variables**
   Create `frontend/.env`:
   ```env
   VITE_APP_API_URL=http://localhost:5000/api
   VITE_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/wastewise.git
   cd wastewise
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   ```

3. **Start development servers:**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm start
   
   # Frontend (Terminal 2)
   cd frontend && npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:5000

---

## 🚀 Deployment (Render.com)

### Step 1: Database Setup
1. Create free MongoDB Atlas cluster
2. Whitelist IPs: `0.0.0.0/0` (for development)
3. Get connection string

### Step 2: Backend Deployment
1. Push backend code to GitHub
2. Create **Web Service** on Render.com
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables in Render dashboard

### Step 3: Frontend Deployment
1. Push frontend code to GitHub
2. Create **Static Site** on Render.com
3. Connect GitHub repository
4. Set build command: `npm install && npm run build`
5. Set publish directory: `dist`
6. Add environment variables in Render dashboard

### Step 4: CORS Configuration
Update `server/server.js`:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5174",
    "https://wastewise-1-v9qh.onrender.com",
    "https://wastewise-ngki.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

---

## 🧩 Project Structure

```
wastewise/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── assets/          # Images and assets
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static files
│   └── package.json         # Frontend dependencies
│
├── backend/                  # Node.js backend application
│   ├── routes/              # API routes
│   ├── models/              # Database models
│   ├── middleware/          # Express middleware
│   ├── uploads/             # Uploaded files
│   ├── server.js            # Entry point
│   └── package.json         # Backend dependencies
│
└── README.md                # Project documentation
```

---

## 🚀 Quick Commands

```bash
# Local Development
# Backend
cd backend && npm install && npm start

# Frontend  
cd frontend && npm install && npm run dev

# Production Build
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm run build
```

---

## 📬 Contact

- 📧 [ssomasekhar018@gmail.com](mailto:ssomasekhar018@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/somasekharasrinivas-sannapaneni-32a790291/)
- [GitHub](https://github.com/ssomasekhar018)

---

## 🙏 Credits

- [React](https://reactjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database
- [Render.com](https://render.com/) for deployment
- [Google Maps API](https://developers.google.com/maps) for location services

---

<p align="center">
  <b>Made with ❤️ for Smart Waste Management</b>
</p>

