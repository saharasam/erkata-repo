import 'package:flutter/material.dart';
import '../../models/dev_file.dart';
import '../../widgets/modern_app_bar.dart';

class FileViewPage extends StatelessWidget {
  final DevFile file;
  const FileViewPage({super.key, required this.file});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ModernAppBar(title: Text(file.name)),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: const Color(0xFF1E1E1E),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: SelectableText(
            file.content,
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 13,
              color: Color(0xFFD4D4D4),
            ),
          ),
        ),
      ),
    );
  }
}
