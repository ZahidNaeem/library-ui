import {BASE_URL} from "../common/Constants";
import axios from "axios";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

instance.interceptors.request.use((config) => {
  const authorization = JSON.parse(localStorage.getItem('authorization'));

  if (authorization) {
    config.headers['Authorization'] = `${authorization.tokenType} ${authorization.accessToken}`;
  }
  return config;
});
instance.interceptors.response.use((response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login'; // Redirect to login page
      }
      return Promise.reject(error);
    }
);
export default instance;