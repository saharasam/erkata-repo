import 'dev_file.dart';

class FileNode {
  final String name;
  final String fullPath;
  final bool isDirectory;
  final DevFile? file;
  final List<FileNode> children;

  FileNode({
    required this.name,
    required this.fullPath,
    required this.isDirectory,
    this.file,
    required this.children,
  });

  static FileNode buildTree(List<DevFile> files) {
    final FileNode root = FileNode(
      name: "root",
      fullPath: "",
      isDirectory: true,
      children: [],
    );

    for (var file in files) {
      final parts = file.path.split(RegExp(r'[/\\]'));
      FileNode current = root;
      String currentPath = "";

      for (int i = 0; i < parts.length; i++) {
        final part = parts[i];
        if (part.isEmpty) continue;

        currentPath = currentPath.isEmpty ? part : "$currentPath/$part";
        final isLast = i == parts.length - 1;

        FileNode? existing = current.children.cast<FileNode?>().firstWhere(
          (n) => n?.name == part,
          orElse: () => null,
        );

        if (existing == null) {
          final newNode = FileNode(
            name: part,
            fullPath: currentPath,
            isDirectory: !isLast,
            file: isLast ? file : null,
            children: [],
          );
          current.children.add(newNode);
          current = newNode;
        } else {
          current = existing;
        }
      }
    }

    _sortTree(root);
    return root;
  }

  static void _sortTree(FileNode node) {
    node.children.sort((a, b) {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
    for (var child in node.children) {
      if (child.isDirectory) _sortTree(child);
    }
  }
}
