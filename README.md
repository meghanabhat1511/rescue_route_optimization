# Rescue Route Optimization

AI-powered emergency rescue and evacuation route optimization dashboard built using React, Vite, and MERN stack concepts.

# AI-Powered Rescue Route Optimization System

An intelligent disaster response and evacuation management platform built using the MERN stack. The system provides AI-based rescue route optimization, real-time GPS tracking, live hazard monitoring, and emergency coordination during natural or man-made disasters.

Project Overview
The AI-Powered Rescue Route Optimization System helps emergency responders and civilians by identifying the safest and fastest evacuation routes during disasters such as floods, fires, earthquakes, cyclones, and landslides.

The platform uses real-time data, AI route prediction, GPS tracking, and live disaster updates to improve emergency response efficiency and reduce rescue delays.

Features
  Real-Time GPS Tracking
- Live tracking of rescue teams and emergency vehicles
- Real-time location updates
- Navigation assistance

 AI Route Prediction
- Finds safest evacuation routes
- Predicts fastest rescue paths
- Avoids blocked or dangerous areas

Hazard Detection & Alerts
- Flood alerts
- Fire alerts
- Landslide warnings
- Disaster notifications

 Interactive Map Integration
- Live map visualization using Mapbox
- Safe zones and danger zones
- Rescue route display

 Emergency Coordination Dashboard
- Monitor rescue operations
- Assign rescue teams
- Track ongoing evacuations

 ETA & Safety Analysis
- Estimated arrival time prediction
- Route safety score
- Traffic and hazard analysis

Tech Stack
Frontend
- React.js
- Tailwind CSS
- Axios
- Socket.IO Client
Backend
- Node.js
- Express.js
- Socket.IO

 Database
- MongoDB Atlas

 APIs & Services
- Mapbox API
- OpenWeather API
- GPS APIs

 AI & Machine Learning
- TensorFlow / Python ML Models
- Route Optimization Algorithms

- Project Structure

```text
rescue-route-system/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.js
│
├── server/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── ai/
│   ├── socket/
│   └── server.js
│
├── package.json
├── README.md
└── .env
```

---

Installatio
Clone the Repository

```bash
git clone https://github.com/your-username/rescue-route-system.git
```

 Navigate to Project Folder

```bash
cd rescue-route-system
```

Install Frontend Dependencies

```bash
cd client
npm install
```

Install Backend Dependencies

```bash
cd ../server
npm install
```

---
 Running the Project

Start Backend Server

```bash
npm start
```

 Start Frontend
Open another terminal:

```bash
cd client
npm start
```

 Mapbox Setup

Create a Mapbox account from:

- https://www.mapbox.com/

Get your Mapbox API key and add it to the `.env` file:

```env
MAPBOX_TOKEN=your_mapbox_token
```

---

 Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
MAPBOX_TOKEN=your_mapbox_token
```

---

 AI Functionalities

- Dynamic route optimization
- Hazard prediction
- Traffic-aware evacuation
- Risk classification
- Real-time ETA calculation

 System Workflow

1. User requests rescue assistance
2. GPS coordinates are collected
3. AI analyzes:
   - Traffic
   - Weather
   - Hazards
   - Road conditions
4. Best evacuation route is generated
5. Rescue teams receive live updates

---

Applications

- Flood rescue operations
- Earthquake evacuation
- Fire emergency response
- Smart city disaster management
- Emergency medical response systems

Future Enhancements
- Drone integration
- Offline emergency navigation
- Satellite monitoring
- AI chatbot support
- IoT disaster sensors

 Team Members
Pranathi
Anaghaa
Meghana

 License
This project is developed for educational and hackathon purposes.

Conclusion
The AI-Powered Rescue Route Optimization System improves disaster response by combining AI, GPS tracking, and real-time analytics to provide safer and faster rescue operations during emergencies.
