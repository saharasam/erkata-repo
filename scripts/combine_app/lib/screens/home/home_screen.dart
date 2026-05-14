import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../services/socket_service.dart';
import '../../models/project_data.dart';
import '../../widgets/modern_app_bar.dart';
import '../project_details/project_files_screen.dart';
import '../settings/settings_page.dart';
import 'dart:io';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final projects = socketService.allProjects;

    return Scaffold(
      appBar: ModernAppBar(
        title: const Text('Tracked Codebases'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep, size: 22),
            tooltip: 'Clear All Data',
            onPressed: () => _confirmClearAll(context),
          ),
          IconButton(
            icon: const Icon(Icons.settings, size: 22),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsPage()),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: socketService.refresh,
        child: projects.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                  const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.source, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text("No codebases tracked yet."),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Center(
                    child: ElevatedButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const SettingsPage(),
                        ),
                      ),
                      child: const Text("Add Sync Server"),
                    ),
                  ),
                ],
              )
            : ListView.builder(
                padding: const EdgeInsets.only(top: 16, bottom: 16),
                physics: const AlwaysScrollableScrollPhysics(),
                itemCount: projects.length,
                itemBuilder: (context, index) {
                  final project = projects[index];
                  final connection = socketService.activeConnections
                      .cast<ProjectConnection?>()
                      .firstWhere(
                        (c) => c?.projectName == project.name,
                        orElse: () => null,
                      );

                  return Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 4,
                      ),
                      leading: CircleAvatar(
                        backgroundColor: connection?.isConnected == true
                            ? Colors.greenAccent
                            : Colors.blueGrey.withOpacity(0.3),
                        child: Icon(
                          Icons.folder_rounded,
                          color: connection?.isConnected == true
                              ? Colors.black
                              : Colors.white70,
                        ),
                      ),
                      title: Text(
                        project.name,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        "${project.files.length} files • Last sync: ${DateFormat('h:mm a').format(project.lastSync)}",
                        style: TextStyle(
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurfaceVariant.withOpacity(0.7),
                        ),
                      ),
                      trailing: const Icon(
                        Icons.chevron_right_rounded,
                        color: Colors.grey,
                      ),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              ProjectFilesScreen(project: project),
                        ),
                      ),
                      onLongPress: () => _showProjectOptions(context, project),
                    ),
                  );
                },
              ),
      ),
    );
  }

  void _confirmClearAll(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Clear All Data?"),
        content: const Text(
          "This will remove all tracked codebases and disconnect all active servers. This cannot be undone.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              socketService.clearAllProjects();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("All data cleared.")),
              );
            },
            child: const Text("Clear All", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showProjectOptions(BuildContext context, ProjectData project) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.download),
              title: const Text('Download Consolidated File'),
              onTap: () {
                Navigator.pop(context);
                _downloadProject(project);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete, color: Colors.red),
              title: const Text(
                'Delete Tracking',
                style: TextStyle(color: Colors.red),
              ),
              onTap: () {
                Navigator.pop(context);
                _confirmDelete(context, project);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _downloadProject(ProjectData project) async {
    try {
      final String content = project.files
          .map((f) => "===== FILE: ${f.path} =====\n${f.content}")
          .join('\n\n');

      final saveDir = socketService.savePath;
      if (saveDir == null) {
        _showNoSavePathError(context);
        return;
      }

      final file = File('$saveDir/${project.name}_combined.txt');
      await file.writeAsString(content);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Saved to: ${file.path}"),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Failed to save: $e")));
      }
    }
  }

  void _showNoSavePathError(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text("Please set a Save Location in Settings first."),
        action: SnackBarAction(
          label: "Settings",
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const SettingsPage()),
          ),
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, ProjectData project) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Delete Tracking?"),
        content: Text(
          "Are you sure you want to stop tracking '${project.name}' and delete its data?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              socketService.removeProject(project.name);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text("'${project.name}' removed.")),
              );
            },
            child: const Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
