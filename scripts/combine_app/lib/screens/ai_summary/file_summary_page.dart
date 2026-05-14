import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../services/socket_service.dart';
import '../../services/ai_service.dart';
import '../../core/constants.dart';
import '../../widgets/modern_app_bar.dart';

class FileSummaryPage extends StatefulWidget {
  final String title;
  final String content;
  const FileSummaryPage({
    super.key,
    required this.title,
    required this.content,
  });

  @override
  State<FileSummaryPage> createState() => _FileSummaryPageState();
}

class _FileSummaryPageState extends State<FileSummaryPage> {
  bool _loading = true;
  String _summary = "";

  @override
  void initState() {
    super.initState();
    _generateSummary();
  }

  Future<void> _generateSummary() async {
    final aiProvider = socketService.aiProvider;

    try {
      String result;
      if (aiProvider == AiProvider.google) {
        result = await AiService.generateGeminiSummary(
          apiKey: socketService.apiKey,
          systemPrompt: socketService.systemPrompt,
          title: widget.title,
          content: widget.content,
        );
      } else {
        result = await AiService.generateNvidiaSummary(
          apiKey: socketService.nvidiaApiKey,
          modelName: socketService.nvidiaModel,
          systemPrompt: socketService.systemPrompt,
          title: widget.title,
          content: widget.content,
        );
      }

      if (mounted) {
        setState(() {
          _loading = false;
          _summary = result;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _summary = e.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: ModernAppBar(
        title: Text(widget.title),
        actions: [
          if (!_loading && _summary.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.copy_rounded),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: _summary));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Summary copied to clipboard")),
                );
              },
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Markdown(
              data: _summary,
              selectable: true,
              styleSheet: MarkdownStyleSheet.fromTheme(
                Theme.of(context),
              ).copyWith(p: const TextStyle(fontSize: 15, height: 1.5)),
            ),
    );
  }
}
