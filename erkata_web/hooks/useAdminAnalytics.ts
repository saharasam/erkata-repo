import { useState, useEffect } from 'react';
import api from '../utils/api';

export type TimeWindow = 'today' | 'week' | 'all';

export interface AdminAnalyticsSummary {
    totalUsers: number;
    totalRequests: number;
    agentCount: number;
    operatorCount: number;
    resolutionRate: string;
    window: TimeWindow;
    activeRequests: number;
    fulfilledInWindow: number;
    activeDisputes: number;
    avgAssignmentTimeMs: number | null;
    avgFulfillmentTimeMs: number | null;
}

export const useAdminAnalytics = (window: TimeWindow = 'all') => {
    const [data, setData] = useState<AdminAnalyticsSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/admin/analytics/summary`, {
                params: { window }
            });
            setData(response.data);
        } catch (err: any) {
            console.error('Failed to fetch admin analytics:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [window]);

    return { data, loading, error, refetch: fetchAnalytics };
};
