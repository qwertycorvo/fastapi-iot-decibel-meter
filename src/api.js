const API_BASE_URL = 'http://localhost:8000';

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users/`);
  return response.json();
};

export const createUser = async (user) => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return response.json();
};

export const updateUser = async (userId, user) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const fetchDevices = async () => {
  const response = await fetch(`${API_BASE_URL}/devices/`);
  return response.json();
};

export const createDevice = async (device) => {
  const response = await fetch(`${API_BASE_URL}/devices/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device),
  });
  return response.json();
};

export const updateDevice = async (deviceId, device) => {
  const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device),
  });
  return response.json();
};

export const deleteDevice = async (deviceId) => {
  const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const fetchViolations = async () => {
  const response = await fetch(`${API_BASE_URL}/violations/`);
  return response.json();
};

export const createViolation = async (violation) => {
  const response = await fetch(`${API_BASE_URL}/violations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(violation),
  });
  return response.json();
};

export const fetchReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/`);
  return response.json();
};

export const fetchReport = async (reportId) => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
  return response.json();
};

export const createReport = async (report) => {
  const response = await fetch(`${API_BASE_URL}/reports/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  return response.json();
};

export const updateReport = async (reportId, report) => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  return response.json();
};

export const fetchStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats/`);
  return response.json();
};

export const updateStats = async (stats) => {
  const response = await fetch(`${API_BASE_URL}/stats/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  });
  return response.json();
};

export const getPrediction = async (dbLevel, hour) => {
  const response = await fetch(`${API_BASE_URL}/predict/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ db_level: dbLevel, hour: hour }),
  });
  return response.json();
};
