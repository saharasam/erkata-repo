import axios from "axios";

let accessToken = "";
export let isAuthReady = false;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const setAuthReady = (ready: boolean) => {
  isAuthReady = ready;
};

export const getAccessToken = () => accessToken;

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Request Interceptor: Attach Bearer Token and check Auth Readiness
api.interceptors.request.use(
  (config) => {
    // Only block if auth is not ready and it's not a refresh/login/logout call
    const isAuthCall =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/refresh") ||
      config.url?.includes("/auth/logout") ||
      config.url?.includes("/auth/register");

    if (!isAuthReady && !isAuthCall) {
      // Ideally queue here, but for MVP we reject to force developers to handle on-mount logic
      return Promise.reject(
        new Error("Auth not ready. Verify checkSession has completed."),
      );
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Attach CSRF Token for all mutating requests
    if (config.method && config.method.toUpperCase() !== "GET") {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not a retry yet (and not a login/refresh request itself)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const csrfToken = getCookie("csrfToken");
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {}
          },
        );

        if (res.status === 201 || res.status === 200) {
          const newToken = res.data.accessToken;
          setAccessToken(newToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear session
        setAccessToken("");
        setAuthReady(false);
        window.location.href = "/#/login"; // HashRouter friendly
        return Promise.reject(refreshError);
      }
    }

    // Handle global errors (excluding auth flow)
    if (error.response && error.response.status !== 401) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Extract message from NestJS common response structure
        const message = data.message || data.error || "An unexpected system error occurred.";
        const title = status === 400 ? "Validation Failed" : 
                      status === 403 ? "Access Restricted" : "Service Error";

        // Dispatch global event for ModalContext to pick up
        window.dispatchEvent(new CustomEvent('erkata:api-error', { 
            detail: { 
                message: Array.isArray(message) ? message[0] : message,
                title,
                type: 'error'
            } 
        }));
    }

    return Promise.reject(error);
  },
);

export const getAssetUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;
