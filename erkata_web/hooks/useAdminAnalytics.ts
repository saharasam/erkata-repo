import { useState, useEffect } from 'react';
import api from '../utils/api';

// Define the exact time filters requested
export type TimeWindow = 'day' | 'week' | 'month' | 'year' | 'all';

// Group the data into the five clear sections
export interface AdminAnalyticsSummary {
    financial: {
        commissionsPaid: number;
        pendingWithdrawals: number;
        approvedWithdrawals: number;
    };
    traffic: {
        receivedToday: number;
        receivedWeek: number;
        receivedMonth: number;
        pending: number;
        assigned: number;
        fulfilled: number;
        disputed: number;
    };
    network: {
        agents: number;
        operators: number;
        admins: number;
        suspended: number;
        growth: number;
    };
    packages: {
        active: { tier: string; count: number }[];
        upgrades: number;
        revenue: number;
    };
    speedRisk: {
        operatorSpeed: string; // Example: "14m"
        agentSpeed: string;    // Example: "2d 4h"
        warnings: number;
        escalated: number;
    };
}

export const useAdminAnalytics = (window: TimeWindow = 'all') => {
    const[data, setData] = useState<AdminAnalyticsSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            // Send the selected time filter to the server
            const response = await api.get(`/admin/analytics/summary`, {
                params: { window }
            });
            setData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [window]);

    return { data, loading, error, refetch: fetchAnalytics };
};