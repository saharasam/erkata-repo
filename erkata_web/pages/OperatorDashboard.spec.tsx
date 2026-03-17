import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OperatorDashboard from './OperatorDashboard';
import { AuthProvider } from '../contexts/AuthProvider';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../contexts/ModalContext';
import api from '../utils/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mocking dependencies
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../contexts/ModalContext', () => ({
  useModal: vi.fn(),
}));

vi.mock('../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock Lucide icons to avoid rendering complexities
vi.mock('lucide-react', () => ({
  Users: () => <div data-testid="icon-users" />,
  Clock: () => <div data-testid="icon-clock" />,
  Search: () => <div data-testid="icon-search" />,
  MapPin: () => <div data-testid="icon-mappin" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
  LayoutGrid: () => <div data-testid="icon-grid" />,
  List: () => <div data-testid="icon-list" />,
  ChevronRight: () => <div data-testid="icon-chevron" />,
  Filter: () => <div data-testid="icon-filter" />,
}));

// Mock components to simplify the test
vi.mock('../components/DashboardLayout', () => ({
    default: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>
}));

vi.mock('../components/operator/OperatorSidebar', () => ({
    default: () => <div data-testid="operator-sidebar" />
}));

describe('OperatorDashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { id: 'op-1', role: 'operator', zoneId: 'zone-1' },
    });
    (useModal as any).mockReturnValue({
      showAlert: vi.fn(),
      showConfirm: vi.fn(),
    });
  });

  it('should fetch and display pending requests', async () => {
    const mockRequests = [
      { id: '1', category: 'Real Estate', description: 'Test Request', zone: { name: 'Bole' }, createdAt: new Date().toISOString() },
    ];
    const mockTransactions = [];

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/requests/queue')) {
        return Promise.resolve({ data: mockRequests });
      }
      if (url === '/transactions') {
        return Promise.resolve({ data: mockTransactions });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <OperatorDashboard />
      </MemoryRouter>
    );

    // Should show loading initially
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Request')).toBeInTheDocument();
    });

    expect(screen.getByText('Bole')).toBeInTheDocument();
    expect(screen.getByText('RQ-1')).toBeInTheDocument();
  });

  it('should show error alert if API fails', async () => {
    const showAlertMock = vi.fn();
    (useModal as any).mockReturnValue({
      showAlert: showAlertMock,
    });

    (api.get as any).mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <OperatorDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(showAlertMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        type: 'error',
      }));
    });
  });
});
