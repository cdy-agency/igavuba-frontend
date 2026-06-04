import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

export default api;
