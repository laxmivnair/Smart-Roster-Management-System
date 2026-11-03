import axios from 'axios';

// In production, use VITE_API_URL if set; otherwise fallback to local proxy /api/roster
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return `${base}/api/roster`;
  }
  return '/api/roster';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMetadata = async () => {
  const res = await api.get('/metadata');
  return res.data.data;
};

export const getRoster = async (year, month) => {
  const res = await api.get(`/${year}/${month}`);
  return res.data.data;
};

export const generateRoster = async (month, year) => {
  const res = await api.post('/generate', { month, year });
  return res.data.data;
};

export const updateShiftCell = async (payload) => {
  const res = await api.patch('/cell', payload);
  return res.data.data;
};

export const simulateLeave = async (payload) => {
  const res = await api.post('/simulate-leave', payload);
  return res.data.data;
};

export const applyBackup = async (payload) => {
  const res = await api.post('/apply-backup', payload);
  return res.data.data;
};

export const resetSeedData = async () => {
  const res = await api.post('/reset-seed');
  return res.data;
};

export default api;
