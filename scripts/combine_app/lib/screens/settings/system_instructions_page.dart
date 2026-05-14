import 'package:flutter/material.dart';
import '../../services/socket_service.dart';
import '../../widgets/modern_app_bar.dart';

class SystemInstructionsPage extends StatefulWidget {
  const SystemInstructionsPage({super.key});

  @override
  State<SystemInstructionsPage> createState() => _SystemInstructionsPageState();
}

class _SystemInstructionsPageState extends State<SystemInstructionsPage> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: socketService.systemPrompt);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const ModernAppBar(title: Text("AI Instructions")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Define how the AI should summarize or analyze your files.",
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.secondary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white10),
                ),
                child: TextField(
                  controller: _controller,
                  maxLines: null,
                  expands: true,
                  textAlignVertical: TextAlignVertical.top,
                  onChanged: (value) => socketService.setSystemPrompt(value),
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 14),
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.all(16),
                    border: InputBorder.none,
                    hintText: "Enter instructions here...",
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
