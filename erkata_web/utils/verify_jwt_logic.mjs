
import axios from 'axios';

// Mocking the environment to simulate api.ts behavior
const VITE_API_URL = "http://localhost:3000";
let accessToken = "";
let isAuthReady = false;

const setAccessToken = (token) => {
  accessToken = token;
};

const setAuthReady = (ready) => {
  isAuthReady = ready;
};

const api = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true,
});

// Replicating Request Interceptor from api.ts
api.interceptors.request.use(
  (config) => {
    const isAuthCall =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/refresh") ||
      config.url?.includes("/auth/logout") ||
      config.url?.includes("/auth/register");

    if (!isAuthReady && !isAuthCall) {
      return Promise.reject(new Error("Auth not ready."));
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// TEST SUITE
async function runTests() {
  console.log("--- Starting JWT Logic Verification ---");

  // Test 1: Block requests when Auth is not ready
  try {
    console.log("[Test 1] Attempting request before auth is ready...");
    await api.get('/profile');
    console.error("FAIL: Request should have been blocked");
  } catch (e) {
    if (e.message === "Auth not ready.") {
      console.log("PASS: Request blocked as expected");
    } else {
      console.error("FAIL: Unexpected error:", e.message);
    }
  }

  // Test 2: Allow auth calls even if not ready
  try {
    console.log("[Test 2] Attempting login call (auth ready = false)...");
    // Mocking the actual network call to avoid connection error
    const loginConfig = { url: '/auth/login' };
    const processedConfig = await api.interceptors.request.handlers[0].fulfilled(loginConfig);
    if (processedConfig.url === '/auth/login') {
      console.log("PASS: Login call allowed");
    }
  } catch (e) {
    console.error("FAIL: Login call should have been allowed", e);
  }

  // Test 3: Verify Authorization header attachment
  console.log("[Test 3] Setting access token and verifying header...");
  setAuthReady(true);
  setAccessToken("test_jwt_token_123");
  
  const testConfig = { url: '/requests', headers: {} };
  const finalConfig = await api.interceptors.request.handlers[0].fulfilled(testConfig);
  
  if (finalConfig.headers.Authorization === "Bearer test_jwt_token_123") {
    console.log("PASS: Authorization header correctly attached");
  } else {
    console.error("FAIL: Authorization header missing or incorrect", finalConfig.headers.Authorization);
  }

  console.log("--- Logic Verification Complete ---");
}

runTests().catch(console.error);
