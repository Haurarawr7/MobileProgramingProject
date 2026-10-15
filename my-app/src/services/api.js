import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

if (!baseURL) {
  throw new Error('EXPO_PUBLIC_BACKEND_API_URL is not configured.');
}

export const BACKEND_API_URL = baseURL.replace(/\/+$/, '');

const Api = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default Api;
