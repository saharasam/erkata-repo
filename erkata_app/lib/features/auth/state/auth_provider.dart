import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
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

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.isHydrated = false,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    bool? isHydrated,
    UserProfile? user,
    String? errorMessage,
    bool clearError = false,
    bool clearUser = false,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isHydrated: isHydrated ?? this.isHydrated,
      user: clearUser ? null : (user ?? this.user),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
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
  StreamSubscription<void>? _sessionExpiredSub;

  AuthNotifier({
    required AuthRepository repo,
    required TokenStorage tokenStorage,
    required ApiClient apiClient,
  }) : _repo = repo,
       _tokenStorage = tokenStorage,
       _apiClient = apiClient,
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
      final token = await _tokenStorage.getAccessToken();

      if (token == null || token.isEmpty) {
        state = state.copyWith(isHydrated: true);
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
        );
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
        );
      } catch (_) {
        // Refresh failed — user must re-authenticate
        await _tokenStorage.clearAll();
        state = state.copyWith(isHydrated: true);
      }
    } catch (_) {
      state = state.copyWith(isHydrated: true);
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

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      );
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
      state = state.copyWith(isLoading: false);
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
    state = const AuthState(isHydrated: true);
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
    state = const AuthState(isHydrated: true);
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

final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return ApiClient(tokenStorage: tokenStorage);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepositoryImpl(dio: apiClient.dio);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    repo: ref.watch(authRepositoryProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
    apiClient: ref.watch(apiClientProvider),
  );
});
