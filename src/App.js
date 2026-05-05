import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Welcome from './components/Welcome';
import LoginSuccess from './components/LoginSuccess';
import Dashboard from './components/Dashboard';
import Devices from './components/Devices';
import Violations from './components/Violations';
import Users from './components/Users';
import Settings from './components/Settings';
import UserSettings from './components/UserSettings';
import ReportForm from './components/ReportForm';
import Reports from './components/Reports';
import ReportDetails from './components/ReportDetails';
import * as api from './api';

function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);

  // lifted state
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({
    activeSensors: 0,
    highestDb: 0,
    violationsToday: 0,
    onlineDevices: 0,
  });
  const [violations, setViolations] = useState([]);
  const [reports, setReports] = useState([]);

  const [userEmail, setUserEmail] = useState('');
  const [currentUser, setCurrentUser] = useState({
    email: '',
    username: '',
    phone: '',
    picture: '',
  });

  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, devicesData, statsData, violationsData, reportsData] = await Promise.all([
          api.fetchUsers(),
          api.fetchDevices(),
          api.fetchStats(),
          api.fetchViolations(),
          api.fetchReports(),
        ]);
        setUsers(usersData);
        setDevices(devicesData);
        setStats(statsData);
        setViolations(violationsData);
        setReports(reportsData);
      } catch (error) {
        console.error("Failed to fetch data from API", error);
      }
    };
    fetchData();
  }, []);

  const addReport = async (report) => {
    try {
      const newReport = await api.createReport(report);
      setReports((prev) => [...prev, newReport]);
      // Refresh stats and violations as they might have changed on backend
      const [statsData, violationsData] = await Promise.all([
        api.fetchStats(),
        api.fetchViolations(),
      ]);
      setStats(statsData);
      setViolations(violationsData);
    } catch (error) {
      console.error("Failed to add report", error);
    }
  };

  const updateCurrentUser = (updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const handleLogin = (email) => {
    setLoggedIn(true);
    setUserEmail(email);
    setShowLoginSuccess(true);
    setCurrentUser({
      email,
      username: email.split('@')[0],
      phone: '',
      picture: '',
    });
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserEmail('');
  };

  const ProtectedRoute = ({ children }) => {
    if (!loggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // user handlers
  const addOrUpdateUser = async (user) => {
    try {
      if (user.id) {
        const updated = await api.updateUser(user.id, user);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      } else {
        const created = await api.createUser(user);
        setUsers((prev) => [...prev, created]);
      }
    } catch (error) {
      console.error("Failed to add/update user", error);
    }
  };
  
  const deleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  // device handlers
  const addOrUpdateDevice = async (device) => {
    try {
      // For devices, ID is provided by user or existing
      const exists = devices.some((d) => d.id === device.id);
      if (exists) {
        const updated = await api.updateDevice(device.id, device);
        setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      } else {
        const created = await api.createDevice(device);
        setDevices((prev) => [...prev, created]);
      }
    } catch (error) {
      console.error("Failed to add/update device", error);
    }
  };

  const deleteDevice = async (id) => {
    try {
      await api.deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete device", error);
    }
  };

  const toggleDeviceStatus = async (id) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      const updatedDevice = { ...device, status: device.status === 'online' ? 'offline' : 'online' };
      await addOrUpdateDevice(updatedDevice);
    }
  };

  // stats/violations handlers
  const addViolation = async (violation) => {
    try {
      const created = await api.createViolation(violation);
      setViolations((prev) => [...prev, created]);
      const statsData = await api.fetchStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to add violation", error);
    }
  };

  const updateStats = async (updates) => {
    try {
      const newStats = { ...stats, ...updates };
      const updated = await api.updateStats(newStats);
      setStats(updated);
    } catch (error) {
      console.error("Failed to update stats", error);
    }
  };

  // Helper for report details route
  function ReportDetailsWrapper() {
    const { id } = useParams();
    const [report, setReport] = useState(null);

    useEffect(() => {
      const getReport = async () => {
        const data = await api.fetchReport(id);
        setReport(data);
      };
      getReport();
    }, [id]);

    const handleUpdate = async (updated) => {
      try {
        const result = await api.updateReport(updated.id, updated);
        setReports((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        setReport(result);
        
        // Refresh stats and violations as they might have changed on backend due to status transition
        const [statsData, violationsData] = await Promise.all([
          api.fetchStats(),
          api.fetchViolations(),
        ]);
        setStats(statsData);
        setViolations(violationsData);
      } catch (error) {
        console.error("Failed to update report", error);
      }
    };

    if (!report) return <div>Loading...</div>;
    return <ReportDetails report={report} onUpdate={handleUpdate} currentUser={currentUser} />;
  }

  return (
    <Router>
      <Welcome />
      {showLoginSuccess && <LoginSuccess email={userEmail} onClose={() => setShowLoginSuccess(false)} />}
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={loggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            element={
              <ProtectedRoute>
                <Layout onLogout={handleLogout} userEmail={userEmail} currentUser={currentUser} />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  stats={stats}
                  violations={violations}
                  devices={devices}
                  addViolation={addViolation}
                  updateStats={updateStats}
                />
              }
            />
            <Route
              path="/devices"
              element={
                <Devices
                  devices={devices}
                  addDevice={addOrUpdateDevice}
                  updateDevice={addOrUpdateDevice}
                  deleteDevice={deleteDevice}
                  toggleStatus={toggleDeviceStatus}
                />
              }
            />
            <Route
              path="/user-settings"
              element={<UserSettings currentUser={currentUser} updateUser={updateCurrentUser} />}
            />
            <Route
              path="/violations"
              element={<Violations violations={violations} />}
            />
            <Route
              path="/users"
              element={
                <Users
                  users={users}
                  addUser={addOrUpdateUser}
                  updateUser={addOrUpdateUser}
                  deleteUser={deleteUser}
                />
              }
            />
            <Route
              path="/reports"
              element={<Reports reports={reports} />}
            />
            <Route
              path="/reports/new"
              element={<ReportForm addReport={addReport} />}
            />
            <Route
              path="/reports/:id"
              element={<ReportDetailsWrapper />}
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route
            path="*"
            element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
