import axios from 'axios';
import { APP_BASE_URL } from 'widget/helpers/constants';

axios.interceptors.response.use(response => {
  if (response.headers.get('X-Auth-Token')) {
    setHeader(response.headers.get('X-Auth-Token'));
  }
});

export const API = axios.create({
  baseURL: APP_BASE_URL,
  withCredentials: false,
});

export const setHeader = (value, key = 'X-Auth-Token') => {
  API.defaults.headers.common[key] = value;
  window.authToken = response.headers.get('X-Auth-Token');
};

export const removeHeader = key => {
  delete API.defaults.headers.common[key];
};
