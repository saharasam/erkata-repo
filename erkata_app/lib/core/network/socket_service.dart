import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;

import '../config/env_config.dart';
import '../storage/token_storage.dart';
import '../../features/auth/state/auth_provider.dart';
import '../providers/core_providers.dart';

class SocketService {
  final TokenStorage _tokenStorage;
  socket_io.Socket? _socket;
  final _notificationController = StreamController<Map<String, dynamic>>.broadcast();

  SocketService(this._tokenStorage);

  Stream<Map<String, dynamic>> get notifications => _notificationController.stream;

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    final token = await _tokenStorage.getAccessToken();
    if (token == null) {
      debugPrint('[SocketService] No token found, skipping connection');
      return;
    }

    debugPrint('[SocketService] Connecting to ${EnvConfig.baseUrl}...');
    
    _socket = socket_io.io(EnvConfig.baseUrl, 
      socket_io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': 'Bearer $token'})
        .enableAutoConnect()
        .enableReconnection()
        .build()
    );

    _socket!.onConnect((_) {
      debugPrint('[SocketService] Connected to gateway');
    });

    _socket!.onDisconnect((_) {
      debugPrint('[SocketService] Disconnected from gateway');
    });

    _socket!.onConnectError((err) {
      debugPrint('[SocketService] Connection error: $err');
    });

    _socket!.on('notification', (data) {
      debugPrint('[SocketService] Notification received: $data');
      if (data is Map<String, dynamic>) {
        _notificationController.add(data);
      }
    });

    _socket!.connect();
  }

  void disconnect() {
    debugPrint('[SocketService] Manually disconnecting...');
    _socket?.disconnect();
    _socket = null;
  }
  
  void dispose() {
    _notificationController.close();
    disconnect();
  }
}

final socketServiceProvider = Provider<SocketService>((ref) {
  final storage = ref.watch(tokenStorageProvider);
  final service = SocketService(storage);
  
  // Watch auth state to connect/disconnect reactively
  ref.listen(authProvider, (previous, next) {
    if (next.isAuthenticated) {
      service.connect();
    } else {
      service.disconnect();
    }
  });

  // Handle initial authenticated state (e.g. after hydration)
  final authState = ref.read(authProvider);
  if (authState.isAuthenticated) {
    service.connect();
  }

  ref.onDispose(() {
    service.dispose();
  });

  return service;
});
