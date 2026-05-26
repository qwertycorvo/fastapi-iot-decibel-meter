# Smart IoT Decibel Monitoring System

## Project Description
An AI-powered IoT system designed for real-time noise tracking and classification, with a specific focus on monitoring motorcycle exhaust noise on the streets of Cagayan de Oro City. The system captures audio data via ESP32-connected digital microphones, processes it through a FastAPI backend for AI-driven insights, and displays live metrics on a web dashboard and mobile application.

## Features
- **Real-time Monitoring**: Live decibel tracking from distributed IoT sensors.
- **AI Classification**: Automated noise impact analysis (Critical, Moderate, Normal) based on decibel levels and time of day.
- **Cross-Platform Dashboards**: Modern web interface (React) and mobile app (Expo) for data visualization.
- **Automated Reporting**: Generates violation reports for noise levels exceeding legal thresholds.
- **Fleet Management**: Track status and locations of all deployed monitoring devices.
- **Scalable Backend**: Robust API for data ingestion and management.

## Technology Stack
- **IoT Hardware**: 
  - ESP32 DevKit V1 (30-pin)
  - INMP441 Digital I2S Microphone
- **Backend**: 
  - FastAPI (Python)
  - SQLAlchemy (ORM)
  - Pydantic (Data Validation)
- **Frontend**: 
  - React (Web Dashboard)
  - Expo SDK / React Native (Mobile App)
  - Tailwind CSS (Styling)
- **Database**: 
  - PostgreSQL (Production via Supabase)
  - SQLite (Local Development)
- **Cloud Services**:
  - Render (Backend Hosting)
  - Vercel (Frontend Hosting)
  - GitHub (Version Control & CI/CD)

## System Architecture
1. **Data Capture**: ESP32 reads 24-bit audio data from the INMP441 via the I2S protocol.
2. **Processing**: ESP32 calculates the RMS and Decibel levels, then sends an HTTP PUT request to the FastAPI backend.
3. **AI Analysis**: Backend classifies the noise impact using time-of-day logic and stored AI models.
4. **Storage**: Data is persisted in the Supabase PostgreSQL database.
5. **Visualization**: The React and Expo frontends fetch the latest stats via GET requests and display them in real-time.

---
Developed for noise regulation and urban planning.

## Installation & Setup
### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

### Frontend
1. `npm install`
2. `npm start`

### Mobile
1. `cd mobile`
2. `npm install`
3. `npx expo start`

## Deployment Links
- **Web Dashboard**: [https://decibel-meter-frontend.vercel.app/](https://decibel-meter-frontend.vercel.app/)
- **API Documentation**: [https://fastapi-iot-decibel-meter.onrender.com/docs](https://fastapi-iot-decibel-meter.onrender.com/docs)

## Team Members and Roles
- **Ra Mikel**: Project Manager
- **Ryan Otacan**: Frontend Developer
- **John Loyd Abang**: Backend Developer
