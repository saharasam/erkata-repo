import 'dart:io';
import 'package:flutter/material.dart';
import '../models/dev_file.dart';
import '../models/file_node.dart';
import '../services/socket_service.dart';
import '../screens/file_viewer/file_view_page.dart';
import '../screens/ai_summary/file_summary_page.dart';
import '../screens/settings/settings_page.dart';

class FileTreeItem extends StatelessWidget {
  final FileNode node;
  final int depth;

  const FileTreeItem({super.key, required this.node, this.depth = 0});

  @override
  Widget build(BuildContext context) {
    if (node.isDirectory) {
      return Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: EdgeInsets.only(
            left: 16.0 + (depth * 12.0),
            right: 16.0,
          ),
          leading: Icon(
            Icons.folder_rounded,
            size: 20,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.7),
          ),
          title: GestureDetector(
            onLongPress: () => _showFolderOptions(context, node),
            child: Text(
              node.name,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
          ),
          children: node.children
              .map((child) => FileTreeItem(node: child, depth: depth + 1))
              .toList(),
        ),
      );
    } else {
      return ListTile(
        contentPadding: EdgeInsets.only(
          left: 16.0 + (depth * 12.0) + 36.0,
          right: 16.0,
        ),
        dense: true,
        leading: Icon(
          _getFileIcon(node.name),
          size: 18,
          color: Colors.blueGrey.shade400,
        ),
        title: Text(node.name, style: const TextStyle(fontSize: 14)),
        onTap: () {
          if (node.file != null) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => FileViewPage(file: node.file!),
              ),
            );
          }
        },
        onLongPress: () {
          if (node.file != null) {
            _showFileOptions(context, node.file!);
          }
        },
      );
    }
  }

  IconData _getFileIcon(String name) {
    final ext = name.toLowerCase();
    if (ext.endsWith('.dart')) {
      return Icons.code_rounded;
    }
    if (ext.endsWith('.js') || ext.endsWith('.cjs') || ext.endsWith('.mjs')) {
      return Icons.javascript_rounded;
    }
    if (ext.endsWith('.json')) {
      return Icons.data_object_rounded;
    }
    if (ext.endsWith('.md')) {
      return Icons.description_rounded;
    }
    if (ext.endsWith('.html') || ext.endsWith('.css')) {
      return Icons.web_rounded;
    }
    return Icons.insert_drive_file_rounded;
  }

  void _showFolderOptions(BuildContext context, FileNode node) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                "Folder: ${node.name}",
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(
                Icons.psychology_rounded,
                color: Colors.amber,
              ),
              title: const Text('Explain Folder (AI)'),
              subtitle: const Text(
                'Summarize the architecture of this directory',
              ),
              onTap: () {
                Navigator.pop(context);
                _summarizeFolder(context, node);
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.merge_type_rounded,
                color: Colors.greenAccent,
              ),
              title: const Text('Consolidate Folder'),
              onTap: () {
                Navigator.pop(context);
                _promptForConsolidateName(context, node);
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _summarizeFolder(BuildContext context, FileNode node) {
    final List<DevFile> folderFiles = [];
    _collectFilesRecursive(node, folderFiles);

    if (folderFiles.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("This folder is empty.")));
      return;
    }

    // Combine file contents with clear headers for the AI
    final String combinedContent = folderFiles
        .map((f) {
          return "--- FILE: ${f.path} ---\n${f.content}";
        })
        .join("\n\n");

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FileSummaryPage(
          title: "Folder: ${node.name}",
          content: combinedContent,
        ),
      ),
    );
  }

  void _promptForConsolidateName(BuildContext context, FileNode node) {
    final controller = TextEditingController(text: "${node.name}.txt");
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Consolidate Folder"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Enter a name for the consolidated file:"),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              autofocus: true,
              decoration: const InputDecoration(
                labelText: "Filename",
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _consolidateFolder(context, node, "${node.name}.txt");
            },
            child: const Text("Skip"),
          ),
          ElevatedButton(
            onPressed: () {
              final name = controller.text.trim();
              if (name.isNotEmpty) {
                Navigator.pop(context);
                _consolidateFolder(context, node, name);
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  void _consolidateFolder(
    BuildContext context,
    FileNode node,
    String fileName,
  ) async {
    final List<DevFile> folderFiles = [];
    _collectFilesRecursive(node, folderFiles);

    if (folderFiles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("No files found in this folder.")),
      );
      return;
    }

    try {
      final String content = folderFiles
          .map((f) => "===== FILE: ${f.path} =====\n${f.content}")
          .join('\n\n');

      final saveDir = socketService.savePath;
      if (saveDir == null) {
        _showNoSavePathError(context);
        return;
      }

      final safeFileName = fileName.endsWith('.txt')
          ? fileName
          : "$fileName.txt";
      final file = File('$saveDir/$safeFileName');
      await file.writeAsString(content);

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Saved to: ${file.path}"),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Failed to save: $e")));
      }
    }
  }

  void _showNoSavePathError(BuildContext context) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text("Please set a Save Location in Settings first."),
        action: SnackBarAction(
          label: "Settings",
          onPressed: () {
            if (context.mounted) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsPage()),
              );
            }
          },
        ),
      ),
    );
  }

  void _collectFilesRecursive(FileNode node, List<DevFile> files) {
    if (!node.isDirectory && node.file != null) {
      files.add(node.file!);
    } else {
      for (var child in node.children) {
        _collectFilesRecursive(child, files);
      }
    }
  }

  void _showFileOptions(BuildContext context, DevFile file) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Text(
                file.name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(
                Icons.summarize_rounded,
                color: Colors.blueAccent,
              ),
              title: const Text('Summarize File'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FileSummaryPage(
                      title: file.name,
                      content: file.content,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
