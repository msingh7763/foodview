import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

const TUNNEL_API_URL = 'https://cents-cigarette-proportion-spa.trycloudflare.com/api';
const LAN_API_URL = 'http://192.168.0.105:5001/api';
const LOCAL_API_URL = 'http://localhost:5001/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || TUNNEL_API_URL;
const WEB_API_URL = process.env.EXPO_PUBLIC_WEB_API_URL || LOCAL_API_URL;
const API_CANDIDATES = [API_URL, TUNNEL_API_URL, LAN_API_URL, WEB_API_URL].filter((value, index, list) => list.indexOf(value) === index);

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async (email, password) => {},
  signup: async (name, email, password, role) => {},
  logout: async () => {},
  apiUrl: API_URL
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const [currentApiUrl, setCurrentApiUrl] = useState(API_URL);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentApiUrl(WEB_API_URL);
    }
  }, []);

  useEffect(() => {
    verifyApiUrl();
  }, []);

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (user) {
      if (inAuthGroup || segments.length === 0 || segments[0] === undefined) {
        if (user.role === 'Vendor') {
          router.replace('/(vendor)/dashboard');
        } else {
          router.replace('/(customer)/home');
        }
      }
    }
  }, [user, token, loading, segments]);

  async function loadStorageData() {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load storage details', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchJsonWithTimeout(baseUrl, path, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        signal: controller.signal
      });
      const rawText = await response.text();
      let data = null;

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (_parseError) {
          data = { message: rawText };
        }
      }

      return { response, data };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function verifyApiUrl() {
    for (const baseUrl of API_CANDIDATES) {
      try {
        const healthPath = baseUrl.endsWith('/api') ? '/health' : '/api/health';
        const { response } = await fetchJsonWithTimeout(baseUrl, healthPath);
        if (response.ok) {
          setCurrentApiUrl(baseUrl);
          return;
        }
      } catch (error) {
        continue;
      }
    }
  }

  async function requestWithFallbacks(path, options = {}) {
    const candidateUrls = [currentApiUrl, ...API_CANDIDATES].filter((value, index, list) => list.indexOf(value) === index);

    let lastError = null;

    for (const baseUrl of candidateUrls) {
      try {
        const { response, data } = await fetchJsonWithTimeout(baseUrl, path, options);
        if (response.ok) {
          setCurrentApiUrl(baseUrl);
          return { response, data };
        }

        lastError = new Error(data?.error || `Request failed with status ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to reach the backend API');
  }

  async function login(email, password) {
    const { response, data } = await requestWithFallbacks('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function signup(name, email, password, role) {
    const { response, data } = await requestWithFallbacks('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await requestWithFallbacks('/logout', { method: 'POST' }).catch(() => {});

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, apiUrl: currentApiUrl }}>
      {children}
    </AuthContext.Provider>
  );
}