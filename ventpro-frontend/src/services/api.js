import axios from "axios";
/*api.get(`/window-types/by-pvc/${colorId}`)*/

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "") ||
  "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export const getJSON = (path) => api.get(path).then((r) => r.data);
export const postJSON = (path, data) => api.post(path, data).then((r) => r.data);
export const patchJSON = (path, data) => api.patch(path, data).then((r) => r.data);
export const del = (path) => api.delete(path).then((r) => r.data);

export default api;
