import 'dart:io';
import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants.dart';
import '../models/dev_file.dart';
import '../models/project_data.dart';

final socketService = SocketService();

class SocketService extends ChangeNotifier {
  final Map<String, ProjectConnection> _connections = {};
  final Map<String, ProjectData> _persistedProjects = {};
  final Set<String> _knownIps = {};
  String? _savePath;

  // AI Configuration Variables
  AiProvider _aiProvider = AiProvider.google;
  String _apiKey = "";
  String _nvidiaApiKey = "";
  String _nvidiaModel = "google/gemma-4-31b-it";
  String _systemPrompt = AppConstants.defaultSystemPrompt;

  List<ProjectConnection> get activeConnections => _connections.values.toList();
  List<String> get knownIps => _knownIps.toList();
  String? get savePath => _savePath;

  // Getters for AI Settings
  AiProvider get aiProvider => _aiProvider;
  String get apiKey => _apiKey;
  String get nvidiaApiKey => _nvidiaApiKey;
  String get nvidiaModel => _nvidiaModel;
  String get systemPrompt => _systemPrompt;

  List<ProjectData> get allProjects {
    final Map<String, ProjectData> combined = Map.from(_persistedProjects);
    for (var conn in _connections.values) {
      if (conn.files.isNotEmpty) {
        combined[conn.projectName] = ProjectData(
          name: conn.projectName,
          files: conn.files,
          lastSync: DateTime.now(),
        );
      }
    }
    return combined.values.toList()
      ..sort((a, b) => b.lastSync.compareTo(a.lastSync));
  }

  SocketService() {
    _init();
  }

  Future<void> _init() async {
    await _loadPersistedData();
    await _loadSettings();
    await _loadConfigs();
    _startAutoScan();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _savePath = prefs.getString('save_path');

    final providerIndex = prefs.getInt('ai_provider') ?? 0;
    _aiProvider = AiProvider.values[providerIndex];
    _apiKey = prefs.getString('api_key') ?? "";
    _nvidiaApiKey = prefs.getString('nvidia_api_key') ?? "";
    _nvidiaModel = prefs.getString('nvidia_model') ?? "google/gemma-4-31b-it";
    _systemPrompt = prefs.getString('system_prompt') ?? AppConstants.defaultSystemPrompt;

    notifyListeners();
  }

  Future<void> setSavePath(String? path) async {
    _savePath = path;
    final prefs = await SharedPreferences.getInstance();
    if (path == null) {
      await prefs.remove('save_path');
    } else {
      await prefs.setString('save_path', path);
    }
    notifyListeners();
  }

  Future<void> setApiKey(String key) async {
    _apiKey = key;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('api_key', key);
    notifyListeners();
  }

  Future<void> setAiProvider(AiProvider provider) async {
    _aiProvider = provider;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('ai_provider', provider.index);
    notifyListeners();
  }

  Future<void> setNvidiaApiKey(String key) async {
    _nvidiaApiKey = key;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('nvidia_api_key', key);
    notifyListeners();
  }

  Future<void> setNvidiaModel(String model) async {
    _nvidiaModel = model;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('nvidia_model', model);
    notifyListeners();
  }

  Future<void> setSystemPrompt(String prompt) async {
    _systemPrompt = prompt;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('system_prompt', prompt);
    notifyListeners();
  }

  Future<void> refresh() async {
    final List<Future> scans = [];
    for (var ip in _knownIps) {
      scans.add(scanPorts(ip));
    }
    for (var conn in _connections.values) {
      if (!conn.isConnected && !conn.isAttemptingConnection) {
        scans.add(conn.connect());
      }
    }
    await Future.wait(scans);
    notifyListeners();
  }

  void _startAutoScan() {
    Timer.periodic(const Duration(seconds: 30), (_) {
      for (var ip in _knownIps) {
        scanPorts(ip);
      }
    });
  }

  Future<void> _loadPersistedData() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String>? rawList = prefs.getStringList('persisted_projects');
    if (rawList != null) {
      for (var raw in rawList) {
        try {
          final data = ProjectData.fromJson(jsonDecode(raw));
          _persistedProjects[data.name] = data;
        } catch (_) {}
      }
    }
    notifyListeners();
  }

  Future<void> _loadConfigs() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String>? ips = prefs.getStringList('known_ips');
    if (ips != null) {
      _knownIps.addAll(ips);
      for (var ip in _knownIps) {
        scanPorts(ip);
      }
    }
  }

  Future<void> scanPorts(String ip) async {
    _knownIps.add(ip);
    _saveIps();
    for (int port = AppConstants.portRangeStart; port <= AppConstants.portRangeEnd; port++) {
      _checkAndAddConnection(ip, port);
    }
  }

  Future<void> _checkAndAddConnection(String ip, int port) async {
    final key = "$ip:$port";
    if (_connections.containsKey(key)) return;
    try {
      final socket = await Socket.connect(
        ip,
        port,
        timeout: const Duration(milliseconds: 500),
      );
      socket.destroy();
      addConnection(ip, port);
    } catch (_) {}
  }

  void addConnection(String ip, int port) {
    final key = "$ip:$port";
    if (_connections.containsKey(key)) return;

    final conn = ProjectConnection(
      ip: ip,
      port: port,
      onUpdate: () {
        _saveProject(key);
        notifyListeners();
      },
    );
    _connections[key] = conn;
    conn.connect();
    notifyListeners();
  }

  void removeConnection(String ip, int port) {
    final key = "$ip:$port";
    final conn = _connections.remove(key);
    conn?.disconnect();
    notifyListeners();
  }

  void removeProject(String projectName) {
    _persistedProjects.remove(projectName);
    _savePersistedProjects();
    final keysToRemove = _connections.entries
        .where((e) => e.value.projectName == projectName)
        .map((e) => e.key)
        .toList();
    for (var key in keysToRemove) {
      final conn = _connections.remove(key);
      conn?.disconnect();
    }
    notifyListeners();
  }

  void clearAllProjects() {
    _persistedProjects.clear();
    _savePersistedProjects();
    for (var conn in _connections.values) {
      conn.disconnect();
    }
    _connections.clear();
    notifyListeners();
  }

  void removeIp(String ip) {
    _knownIps.remove(ip);
    final keysToRemove = _connections.keys
        .where((k) => k.startsWith("$ip:"))
        .toList();
    for (var key in keysToRemove) {
      final conn = _connections.remove(key);
      conn?.disconnect();
    }
    _saveIps();
    notifyListeners();
  }

  Future<void> _saveIps() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('known_ips', _knownIps.toList());
  }

  Future<void> _saveProject(String key) async {
    final conn = _connections[key];
    if (conn == null || conn.files.isEmpty) return;
    _persistedProjects[conn.projectName] = ProjectData(
      name: conn.projectName,
      files: conn.files,
      lastSync: DateTime.now(),
    );
    await _savePersistedProjects();
  }

  Future<void> _savePersistedProjects() async {
    final prefs = await SharedPreferences.getInstance();
    final rawList = _persistedProjects.values
        .map((p) => jsonEncode(p.toJson()))
        .toList();
    await prefs.setStringList('persisted_projects', rawList);
  }
}

class ProjectConnection extends ChangeNotifier {
  final String ip;
  final int port;
  final VoidCallback onUpdate;

  Socket? _socket;
  bool _isConnected = false;
  bool _isAttemptingConnection = false;
  List<DevFile> _files = [];
  String _projectName = "Connecting...";
  final StringBuffer _buffer = StringBuffer();
  Timer? _reconnectTimer;

  bool get isConnected => _isConnected;
  bool get isAttemptingConnection => _isAttemptingConnection;
  List<DevFile> get files => _files;
  String get projectName => _projectName;

  ProjectConnection({
    required this.ip,
    required this.port,
    required this.onUpdate,
  });

  Future<void> connect() async {
    _isAttemptingConnection = true;
    onUpdate();
    _reconnectTimer?.cancel();
    try {
      await _socket?.close();
      _socket = await Socket.connect(
        ip,
        port,
        timeout: const Duration(seconds: 4),
      );
      _isConnected = true;
      _isAttemptingConnection = false;
      onUpdate();
      _socket!.listen(
        _onDataReceived,
        onError: (_) => _handleDisconnect(),
        onDone: () => _handleDisconnect(),
        cancelOnError: true,
      );
    } catch (e) {
      _handleDisconnect();
    }
  }

  void _onDataReceived(List<int> data) {
    try {
      final decodedChunk = utf8.decode(data, allowMalformed: true);
      _buffer.write(decodedChunk);
      String currentBuffer = _buffer.toString();
      if (currentBuffer.contains("---END_OF_TRANSMISSION---")) {
        final parts = currentBuffer.split("---END_OF_TRANSMISSION---");
        String rawBase64 = parts[0].trim();
        if (rawBase64.isNotEmpty) {
          _decodeAndProcess(rawBase64);
        }
        _buffer.clear();
        if (parts.length > 1 && parts[1].isNotEmpty) {
          _buffer.write(parts[1]);
        }
      }
    } catch (e) {
      _buffer.clear();
    }
  }

  Future<void> _decodeAndProcess(String base64String) async {
    try {
      final String rawJson = utf8.decode(
        base64.decode(base64String.replaceAll('\n', '').replaceAll('\r', '')),
      );
      final Map<String, dynamic> decoded = jsonDecode(rawJson);
      _projectName = decoded['projectName'] ?? "Unknown";
      final List<dynamic> fileList = decoded['files'];
      _files = fileList.map((item) => DevFile.fromJson(item)).toList();
      onUpdate();
    } catch (e) {
      debugPrint("Failed to decode sync for $ip:$port: $e");
    }
  }

  void _handleDisconnect() {
    _isConnected = false;
    _isAttemptingConnection = false;
    onUpdate();
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      if (!_isConnected) connect();
    });
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _socket?.destroy();
    _isConnected = false;
    _isAttemptingConnection = false;
  }
}
