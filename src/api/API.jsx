import {BASE_URL} from "../common/Constants";
import axios from "axios";

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

instance.interceptors.response.use((response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.setItem('isLoggedIn', JSON.stringify(false));
        window.location.href = '/login'; // Redirect to login page
      }
      return Promise.reject(error);
    }
);

export default instance;