import axios from "axios";

const api = axios.create({
    baseURL: "https://file-upload-backend.herokuapp.com"
});

export default api;