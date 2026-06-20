import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8000',
  baseURL: "https://inventory-management-backend-7251.onrender.com"
});

export default api;
