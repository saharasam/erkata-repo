enum AiProvider { google, nvidia }

class AppConstants {
  static const String nvidiaBaseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
  static const String defaultSystemPrompt = "Summarize the following code file. Explain what it does and list its main parts.";
  static const int portRangeStart = 4242;
  static const int portRangeEnd = 4252;
}
