import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from './useAuth';

export interface HeartbeatResponse {
  status: string;
  assignmentFound: boolean;
  requestId: string | null;
}

export const useHeartbeat = (isOnline: boolean) => {
  const { user } = useAuth();
  const [pushedRequestId, setPushedRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only Operators heartbeat in the current push-system design
    if (!user || user.role !== 'operator' || !isOnline) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPushedRequestId(null);
      return;
    }

    const sendHeartbeat = async () => {
      try {
        const { data } = await api.post<HeartbeatResponse>('/auth/heartbeat');
        if (data.assignmentFound) {
          setPushedRequestId(data.requestId);
        } else {
          setPushedRequestId(null);
        }
        setError(null);
      } catch (err) {
        console.error('[Heartbeat] Failed to ping backend', err);
        setError('Connection lost. Presence may be offline.');
      }
    };

    // Initial ping
    sendHeartbeat();

    // 10s interval
    intervalRef.current = setInterval(sendHeartbeat, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, isOnline]);

  return { pushedRequestId, error };
};
