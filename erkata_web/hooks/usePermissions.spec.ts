import { renderHook } from "@testing-library/react";
import { usePermissions, Action } from "./usePermissions";
import { useAuth } from './useAuth';
import { UserRole } from "../utils/constants";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true if agent has ACCEPT_REQUEST permission", () => {
    (useAuth as any).mockReturnValue({
      user: { role: UserRole.AGENT },
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission(Action.ACCEPT_REQUEST)).toBe(true);
  });

  it("should return false if agent tries to MANAGE_ADMINS", () => {
    (useAuth as any).mockReturnValue({
      user: { role: UserRole.AGENT },
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission(Action.MANAGE_ADMINS)).toBe(false);
  });

  it("should return true if admin has PROPOSE_RESOLUTION", () => {
    (useAuth as any).mockReturnValue({
      user: { role: UserRole.ADMIN },
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission(Action.PROPOSE_RESOLUTION)).toBe(true);
  });

  it("should return false if no user is logged in", () => {
    (useAuth as any).mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission(Action.ACCEPT_REQUEST)).toBe(false);
  });
});
