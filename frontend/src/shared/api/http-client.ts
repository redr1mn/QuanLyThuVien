import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});
