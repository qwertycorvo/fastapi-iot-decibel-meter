const API_BASE_URL = 'https://fastapi-iot-decibel-meter.onrender.com'; // Production Render Backend

export const fetchStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats/`);
  return response.json();
};

export const fetchViolations = async () => {
  const response = await fetch(`${API_BASE_URL}/violations/`);
  return response.json();
};

export const fetchDevices = async () => {
  const response = await fetch(`${API_BASE_URL}/devices/`);
  return response.json();
};

export const fetchReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/`);
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
