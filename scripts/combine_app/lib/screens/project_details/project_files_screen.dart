import 'package:flutter/material.dart';
import '../../models/project_data.dart';
import '../../models/file_node.dart';
import '../../widgets/modern_app_bar.dart';
import '../../widgets/file_tree_item.dart';

class ProjectFilesScreen extends StatelessWidget {
  final ProjectData project;
  const ProjectFilesScreen({super.key, required this.project});

  @override
  Widget build(BuildContext context) {
    final root = FileNode.buildTree(project.files);

    return Scaffold(
      appBar: ModernAppBar(title: Text(project.name)),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: root.children
            .map((node) => FileTreeItem(node: node))
            .toList(),
      ),
    );
  }
}
