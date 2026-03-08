import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/user_role.dart';

class AuthState {
  final UserRole? role;
  final bool isAuthenticated;

  const AuthState({this.role, this.isAuthenticated = false});

  AuthState copyWith({UserRole? role, bool? isAuthenticated}) {
    return AuthState(
      role: role ?? this.role,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());

  void login(UserRole role) {
    state = AuthState(role: role, isAuthenticated: true);
  }

  void logout() {
    state = const AuthState(isAuthenticated: false);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
