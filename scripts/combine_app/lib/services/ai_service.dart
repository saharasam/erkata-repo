import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:http/http.dart' as http;
import '../core/constants.dart';

class AiService {
  static Future<String> generateGeminiSummary({
    required String apiKey,
    required String systemPrompt,
    required String title,
    required String content,
  }) async {
    if (apiKey.isEmpty) {
      throw "Error: Please set your Gemini API Key in Settings.";
    }

    final model = GenerativeModel(
      model: 'gemini-3.1-flash-lite-preview',
      apiKey: apiKey,
    );

    try {
      final prompt =
          "$systemPrompt \n\n"
          "CONTEXT: The following is code from a project directory named '$title'.\n\n"
          "$content";

      final response = await model.generateContent([Content.text(prompt)]);
      return response.text ?? "The AI could not generate an explanation.";
    } catch (e) {
      throw "Error: Could not connect to Gemini. $e";
    }
  }

  static Future<String> generateNvidiaSummary({
    required String apiKey,
    required String modelName,
    required String systemPrompt,
    required String title,
    required String content,
  }) async {
    if (apiKey.isEmpty) {
      throw "Error: Please set your NVIDIA API Key in Settings.";
    }

    try {
      final url = Uri.parse(AppConstants.nvidiaBaseUrl);
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          "model": modelName,
          "messages": [
            {"role": "system", "content": systemPrompt},
            {
              "role": "user",
              "content":
                  "CONTEXT: The following is code from a project directory named '$title'.\n\n$content",
            },
          ],
          "temperature": 0.2,
          "top_p": 0.7,
          "max_tokens": 1024,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      } else {
        throw "Error: NVIDIA API returned ${response.statusCode}\n${response.body}";
      }
    } catch (e) {
      throw "Error: Could not connect to NVIDIA NIM. $e";
    }
  }
  static Future<String> testGeminiConnection({
    required String apiKey,
  }) async {
    if (apiKey.isEmpty) throw "Error: API Key is empty.";
    final model = GenerativeModel(
      model: 'gemini-3.1-flash-lite-preview',
      apiKey: apiKey,
    );
    final response = await model.generateContent([Content.text("Ping")]);
    return response.text ?? "Success (no text returned)";
  }

  static Future<String> testNvidiaConnection({
    required String apiKey,
    required String modelName,
  }) async {
    if (apiKey.isEmpty) throw "Error: API Key is empty.";
    final url = Uri.parse(AppConstants.nvidiaBaseUrl);
    final response = await http.post(
      url,
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        "model": modelName,
        "messages": [
          {"role": "user", "content": "Ping"},
        ],
        "max_tokens": 10,
      }),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'];
    } else {
      throw "NVIDIA Error: ${response.statusCode}\n${response.body}";
    }
  }
}
