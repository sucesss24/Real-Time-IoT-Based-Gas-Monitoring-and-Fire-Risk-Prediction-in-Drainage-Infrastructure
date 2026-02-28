import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const predictFire = (data) =>
  API.post("/predict", data);

export default API;
