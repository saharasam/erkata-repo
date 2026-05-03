import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../../../core/providers/core_providers.dart';
import '../../customer/data/models/request_form_data.dart';
import '../../customer/data/repositories/request_repository.dart';
import '../data/models/auth_response.dart';
import '../data/models/login_request.dart';
import '../data/models/register_request.dart';
import '../data/models/user_profile.dart';
import '../data/repositories/auth_repository.dart';

// ────────────────────────────────────────────────────────
// Auth State
// ────────────────────────────────────────────────────────

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final bool isHydrated;
  final UserProfile? user;
  final String? errorMessage;
  final bool isFirstLaunch;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.isHydrated = false,
    this.user,
    this.errorMessage,
    this.isFirstLaunch = true,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    bool? isHydrated,
    UserProfile? user,
    String? errorMessage,
    bool clearError = false,
    bool clearUser = false,
    bool? isFirstLaunch,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isHydrated: isHydrated ?? this.isHydrated,
      user: clearUser ? null : (user ?? this.user),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      isFirstLaunch: isFirstLaunch ?? this.isFirstLaunch,
    );
  }
}

// ────────────────────────────────────────────────────────
// Auth Notifier
// ────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;
  final TokenStorage _tokenStorage;
  final ApiClient _apiClient;
  final Ref _ref;
  StreamSubscription<void>? _sessionExpiredSub;

  AuthNotifier({
    required AuthRepository repo,
    required TokenStorage tokenStorage,
    required ApiClient apiClient,
    required Ref ref,
  }) : _repo = repo,
       _tokenStorage = tokenStorage,
       _apiClient = apiClient,
       _ref = ref,
       super(const AuthState()) {
    // Listen for interceptor-level session expiry
    _sessionExpiredSub = _apiClient.authInterceptor.onSessionExpired.listen((
      _,
    ) {
      _forceLogout();
    });
  }

  /// Called once at app startup from the splash screen.
  ///
  /// Reads persisted tokens from secure storage, validates the JWT,
  /// and sets authenticated state without a network call if the token
  /// is still valid.
  Future<void> hydrate() async {
    try {

      final isFirst = await _tokenStorage.isFirstLaunch();
      final token = await _tokenStorage.getAccessToken();

      if (token == null || token.isEmpty) {
        state = state.copyWith(
          isHydrated: true,
          isFirstLaunch: isFirst,
        );
        return;
      }

      // Check JWT expiry locally
      final isExpired = JwtDecoder.isExpired(token);

      if (!isExpired) {
        // Token still valid — restore session from storage
        final profile = await _buildProfileFromStorage();
        state = state.copyWith(
          isAuthenticated: true,
          isHydrated: true,
          user: profile,
          isFirstLaunch: isFirst,
        );

        // Check for orphaned drafts on restart
        _reconcilePendingRequest();
        return;
      }

      // Token expired — attempt silent refresh
      try {
        final newToken = await _repo.refreshToken();
        await _tokenStorage.saveAccessToken(newToken);
        final profile = await _buildProfileFromStorage();
        state = state.copyWith(
          isAuthenticated: true,
          isHydrated: true,
          user: profile,
          isFirstLaunch: isFirst,
        );
      } catch (_) {
        // Refresh failed — user must re-authenticate
        await _tokenStorage.clearAll();
        state = state.copyWith(
          isHydrated: true,
          isFirstLaunch: isFirst,
        );
      }
    } catch (_) {
      final isFirst = await _tokenStorage.isFirstLaunch();
      state = state.copyWith(
        isHydrated: true,
        isFirstLaunch: isFirst,
      );
    }
  }

  /// Authenticates with the backend and persists the session.
  Future<void> login(LoginRequest request) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final AuthResponse response = await _repo.login(request);

      await _tokenStorage.saveAuthData(
        accessToken: response.accessToken,
        userId: response.user.id,
        role: response.user.role ?? 'customer',
        tier: response.user.tier,
        fullName: response.user.fullName,
        email: response.user.email,
      );

      await _tokenStorage.markAsLaunched();

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        isFirstLaunch: false,
      );

      // Post-Signup/Login Reconciliation
      _reconcilePendingRequest();
    } on AppException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Something went wrong',
      );
    }
  }

  /// Creates a new account on the backend.
  /// Does NOT set isAuthenticated — user must confirm email first.
  Future<void> register(RegisterRequest request) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      await _repo.register(request);
      
      // Auto-login after successful registration
      await login(LoginRequest(
        identifier: request.email,
        password: request.password,
      ));
    } on AppException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Registration failed',
      );
    }
  }

  /// Logs out, clears persisted tokens, and resets state.
  Future<void> logout() async {
    try {
      await _repo.logout();
    } catch (_) {
      // Best-effort — network might be down
    }
    await _tokenStorage.clearAll();
    state = const AuthState(isHydrated: true, isFirstLaunch: false);
  }

  /// Refetches the current user profile from the backend.
  Future<void> refreshProfile() async {
    try {
      final profile = await _repo.getProfile();
      
      // Update storage too so it's consistent on restart
      await _tokenStorage.saveUserProfile(
        userId: profile.id,
        role: profile.role ?? 'customer',
        tier: profile.tier,
        fullName: profile.fullName,
        email: profile.email,
      );

      state = state.copyWith(user: profile);
    } catch (e) {
      // If refresh fails, we keep the old data for now
    }
  }

  /// Clears the current error message (e.g., after banner dismissed).
  void clearError() {
    state = state.copyWith(clearError: true);
  }

  Future<void> markAsLaunched() async {
    await _tokenStorage.markAsLaunched();
    // We don't update state.isFirstLaunch here to avoid triggering a router redirect
    // while the user is still in the intake flow. The storage is updated, so 
    // subsequent launches will correctly reflect the state.
  }

  // ──────── Private ────────

  Future<UserProfile> _buildProfileFromStorage() async {
    return UserProfile(
      id: await _tokenStorage.getUserId() ?? '',
      email: await _tokenStorage.getUserEmail(),
      fullName: await _tokenStorage.getUserFullName(),
      role: await _tokenStorage.getUserRole(),
      tier: await _tokenStorage.getUserTier(),
    );
  }

  void _forceLogout() async {
    await _tokenStorage.clearAll();
    state = const AuthState(isHydrated: true, isFirstLaunch: false);
  }

  Future<void> _reconcilePendingRequest() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedData = prefs.getString('erkata_pending_request');
      final savedStep = prefs.getInt('erkata_pending_request_step');

      if (savedData != null && savedStep == 8) {
        final decoded = jsonDecode(savedData);
        final formData = RequestFormData.fromJson(decoded);
        final payload = formData.toBackendPayload();

        await _ref.read(requestRepositoryProvider).createRequest(payload);
        
        // Success — clear draft
        await prefs.remove('erkata_pending_request');
        await prefs.remove('erkata_pending_request_step');
        
        // Optional: Notify UI to refresh if needed
        // but since we are usually redirecting to Home, the initial refresh will catch it.
      }
    } catch (e) {
      // Fail silently for background reconciliation to not interrupt user flow
      debugPrint('Background reconciliation failed: $e');
    }
  }

  @override
  void dispose() {
    _sessionExpiredSub?.cancel();
    super.dispose();
  }
}

// ────────────────────────────────────────────────────────
// Providers
// ────────────────────────────────────────────────────────

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepositoryImpl(dio: apiClient.dio);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    repo: ref.watch(authRepositoryProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
    apiClient: ref.watch(apiClientProvider),
    ref: ref,
  );
});
