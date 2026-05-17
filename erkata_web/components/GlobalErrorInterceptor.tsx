import React, { useEffect } from 'react';
import api from '../utils/api';
import { useModal } from '../contexts/ModalContext';

/**
 * GlobalErrorInterceptor
 * 
 * Listens to all Axios response errors and triggers a Modal Popup
 * for any system-level or unexpected failures.
 */
export const GlobalErrorInterceptor: React.FC = () => {
  const { showAlert } = useModal();

  useEffect(() => {
    // Attach response interceptor
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // 1. Ignore 401 errors (handled by Auth refresh logic in api.ts)
        if (error.response?.status === 401) {
          return Promise.reject(error);
        }

        // 2. Extract message
        const message = error.response?.data?.message || error.message || 'An unexpected system error occurred.';
        
        // 3. Show Popup Alert
        showAlert({
          title: 'System Alert',
          message: message,
          type: 'error',
          confirmText: 'Dismiss'
        });

        return Promise.reject(error);
      }
    );

    // Cleanup on unmount
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [showAlert]);

  return null; // This component doesn't render anything itself
};
