/* eslint-disable no-undef */
import axios from "axios";

export default axios.create({
  baseURL: "https://dms-soe-production.up.railway.app",
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

