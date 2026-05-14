import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../services/socket_service.dart';
import '../../services/ai_service.dart';
import '../../core/constants.dart';
import '../../widgets/modern_app_bar.dart';
import 'system_instructions_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final _ipController = TextEditingController();

  @override
  void initState() {
    super.initState();
    socketService.addListener(_onServiceUpdate);
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    socketService.removeListener(_onServiceUpdate);
    _ipController.dispose();
    super.dispose();
  }

  void _startDiscovery() {
    final ip = _ipController.text.trim();
    if (ip.isNotEmpty) {
      socketService.scanPorts(ip);
      _ipController.clear();
      FocusScope.of(context).unfocus();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Scanning $ip for active codebases...")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final connections = socketService.activeConnections;
    final knownIps = socketService.knownIps;

    return Scaffold(
      appBar: const ModernAppBar(title: Text('Server Settings')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                "Export Settings",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: ListTile(
                leading: const Icon(Icons.folder_shared_rounded),
                title: const Text('Default Save Location'),
                subtitle: Text(
                  socketService.savePath ?? 'Not set (files won\'t be saved)',
                  style: TextStyle(
                    color: socketService.savePath == null
                        ? Colors.orangeAccent
                        : Colors.greenAccent,
                  ),
                ),
                trailing: const Icon(Icons.edit_rounded, size: 20),
                onTap: () async {
                  if (Platform.isAndroid) {
                    if (!await Permission.manageExternalStorage.isGranted) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              "Please enable 'All Files Access' in the settings page that opens.",
                            ),
                            duration: Duration(seconds: 5),
                          ),
                        );
                      }
                      await Permission.manageExternalStorage.request();
                      if (!await Permission.manageExternalStorage.isGranted) {
                        return;
                      }
                    }
                  }

                  try {
                    final String? result = await FilePicker.getDirectoryPath();
                    if (result != null && context.mounted) {
                      socketService.setSavePath(result);
                    }
                  } catch (e) {
                    debugPrint("FilePicker error: $e");
                  }
                },
              ),
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                "AI Configuration",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.settings_suggest_rounded),
                    title: const Text('AI Provider'),
                    trailing: DropdownButton<AiProvider>(
                      value: socketService.aiProvider,
                      underline: const SizedBox(),
                      onChanged: (AiProvider? value) {
                        if (value != null) {
                          socketService.setAiProvider(value);
                        }
                      },
                      items: const [
                        DropdownMenuItem(
                          value: AiProvider.google,
                          child: Text('Google Gemini'),
                        ),
                        DropdownMenuItem(
                          value: AiProvider.nvidia,
                          child: Text('NVIDIA NIM'),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  if (socketService.aiProvider == AiProvider.google)
                    ListTile(
                      leading: const Icon(Icons.vpn_key_rounded),
                      title: const Text('Gemini API Key'),
                      subtitle: Text(
                        socketService.apiKey.isEmpty
                            ? 'Not set'
                            : '••••••••••••',
                        style: TextStyle(
                          color:
                              socketService.apiKey.isEmpty
                                  ? Colors.orangeAccent
                                  : Colors.greenAccent,
                        ),
                      ),
                      trailing: const Icon(Icons.edit_rounded, size: 20),
                      onTap: () => _promptApiKey(context),
                    )
                  else ...[
                    ListTile(
                      leading: const Icon(Icons.vpn_key_rounded),
                      title: const Text('NVIDIA API Key'),
                      subtitle: Text(
                        socketService.nvidiaApiKey.isEmpty
                            ? 'Not set'
                            : '••••••••••••',
                        style: TextStyle(
                          color:
                              socketService.nvidiaApiKey.isEmpty
                                  ? Colors.orangeAccent
                                  : Colors.greenAccent,
                        ),
                      ),
                      trailing: const Icon(Icons.edit_rounded, size: 20),
                      onTap: () => _promptNvidiaApiKey(context),
                    ),
                    const Divider(height: 1, indent: 16, endIndent: 16),
                    ListTile(
                      leading: const Icon(Icons.model_training_rounded),
                      title: const Text('NVIDIA Model'),
                      subtitle: Text(socketService.nvidiaModel),
                      trailing: const Icon(Icons.edit_rounded, size: 20),
                      onTap: () => _promptNvidiaModel(context),
                    ),
                  ],
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: const Icon(Icons.psychology_rounded),
                    title: const Text('AI System Instructions'),
                    subtitle: Text(
                      socketService.systemPrompt,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SystemInstructionsPage(),
                      ),
                    ),
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: const Icon(Icons.bolt_rounded, color: Colors.amber),
                    title: const Text('Test Connection'),
                    subtitle: const Text('Send a simple ping to verify setup'),
                    onTap: () => _testConnection(context),
                  ),
                ],
              ),
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Add Network Host",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Enter your PC's IP address. The app will automatically find all running combine instances.",
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _ipController,
                          decoration: const InputDecoration(
                            labelText: 'IP Address (e.g. 192.168.1.5)',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.computer),
                          ),
                          keyboardType: TextInputType.number,
                          onSubmitted: (_) => _startDiscovery(),
                        ),
                      ),
                      const SizedBox(width: 12),
                      IconButton.filled(
                        onPressed: _startDiscovery,
                        icon: const Icon(Icons.search),
                        tooltip: "Scan IP",
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(),
            if (connections.isNotEmpty) ...[
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Text(
                  "Active Connections",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.blueAccent,
                  ),
                ),
              ),
              ...connections.map(
                (conn) => ListTile(
                  leading: Icon(
                    conn.isConnected ? Icons.cloud_done : Icons.cloud_off,
                    color: conn.isConnected ? Colors.green : Colors.red,
                  ),
                  title: Text(conn.projectName),
                  subtitle: Text("${conn.ip}:${conn.port}"),
                  trailing: IconButton(
                    icon: const Icon(Icons.link_off, color: Colors.grey),
                    onPressed: () =>
                        socketService.removeConnection(conn.ip, conn.port),
                  ),
                ),
              ),
              const Divider(),
            ],
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                "Known Hosts",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            if (knownIps.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "No hosts added yet.",
                  style: TextStyle(color: Colors.grey),
                ),
              )
            else
              ...knownIps.map(
                (ip) => ListTile(
                  leading: const Icon(Icons.settings_remote),
                  title: Text(ip),
                  trailing: IconButton(
                    icon: const Icon(
                      Icons.delete_outline,
                      color: Colors.redAccent,
                    ),
                    onPressed: () => socketService.removeIp(ip),
                  ),
                  onTap: () => socketService.scanPorts(ip),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _promptApiKey(BuildContext context) {
    final controller = TextEditingController(text: socketService.apiKey);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Gemini API Key"),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: "Enter your API Key",
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              socketService.setApiKey(controller.text.trim());
              Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  void _promptNvidiaApiKey(BuildContext context) {
    final controller = TextEditingController(text: socketService.nvidiaApiKey);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("NVIDIA API Key"),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: "Enter your NVIDIA API Key",
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              socketService.setNvidiaApiKey(controller.text.trim());
              Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  void _promptNvidiaModel(BuildContext context) {
    final controller = TextEditingController(text: socketService.nvidiaModel);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("NVIDIA Model Name"),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: "e.g. google/gemma-4-31b-it",
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              socketService.setNvidiaModel(controller.text.trim());
              Navigator.pop(context);
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  Future<void> _testConnection(BuildContext context) async {
    final provider = socketService.aiProvider;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder:
          (context) => const Center(
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text("Testing Connection..."),
                  ],
                ),
              ),
            ),
          ),
    );

    try {
      String result = "";
      if (provider == AiProvider.google) {
        result = await AiService.testGeminiConnection(apiKey: socketService.apiKey);
      } else {
        result = await AiService.testNvidiaConnection(
          apiKey: socketService.nvidiaApiKey,
          modelName: socketService.nvidiaModel,
        );
      }

      if (context.mounted) {
        Navigator.pop(context); // Close loading
        showDialog(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text("Connection Successful"),
                content: Text("AI Response: $result"),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("OK"),
                  ),
                ],
              ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context); // Close loading
        showDialog(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text("Connection Failed"),
                content: Text(e.toString()),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("OK"),
                  ),
                ],
              ),
        );
      }
    }
  }
}
