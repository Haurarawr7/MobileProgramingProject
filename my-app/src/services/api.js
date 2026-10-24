import axios from 'axios';

const DEFAULT_BACKEND_API_URL = 'http://localhost:3000';
const baseURL =
  process.env.EXPO_PUBLIC_BACKEND_API_URL || DEFAULT_BACKEND_API_URL;

export const BACKEND_API_URL = baseURL.replace(/\/+$/, '');

const Api = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default Api;
