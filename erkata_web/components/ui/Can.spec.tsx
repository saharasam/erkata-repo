import React from 'react';
import { render, screen } from '@testing-library/react';
import { Can } from './Can';
import { usePermissions, Action } from '../../hooks/usePermissions';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
  Action: {
    ACCEPT_REQUEST: 'ACCEPT_REQUEST',
    MANAGE_AGENTS: 'MANAGE_AGENTS',
  },
}));

describe('Can Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children if permission is granted', () => {
    (usePermissions as any).mockReturnValue({
      hasPermission: () => true,
    });

    render(
      <Can perform={Action.ACCEPT_REQUEST as any}>
        <div data-testid="allowed">Allowed Content</div>
      </Can>
    );

    expect(screen.getByTestId('allowed')).toBeInTheDocument();
  });

  it('should not render children if permission is denied', () => {
    (usePermissions as any).mockReturnValue({
      hasPermission: () => false,
    });

    render(
      <Can perform={Action.MANAGE_AGENTS as any}>
        <div data-testid="denied">Denied Content</div>
      </Can>
    );

    expect(screen.queryByTestId('denied')).not.toBeInTheDocument();
  });
});
