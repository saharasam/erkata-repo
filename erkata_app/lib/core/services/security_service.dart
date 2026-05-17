import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';

/// Centralized service for device integrity and security checks.
class SecurityService {
  /// Returns true if the device is rooted or jailbroken.
  /// 
  /// On simulators, this might return false positives depending on the OS.
  static Future<bool> isDeviceCompromised() async {
    // Skip check in debug mode for easier development if desired, 
    // but recommended to keep for testing.
    if (kDebugMode && !Platform.isAndroid && !Platform.isIOS) {
      return false;
    }

    try {
      bool jailbroken = await FlutterJailbreakDetection.jailbroken;
      bool developerMode = await FlutterJailbreakDetection.developerMode;
      
      // We block if jailbroken. Developer mode might be allowed 
      // depending on security policy (INSA usually prefers blocking it too).
      return jailbroken || developerMode;
    } catch (e) {
      // If detection fails, assume safe or log error.
      debugPrint('Security check failed: $e');
      return false;
    }
  }
}
