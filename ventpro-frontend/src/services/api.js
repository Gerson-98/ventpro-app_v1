import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // ✅ debe apuntar a tu backend NestJS
});

export default api;
