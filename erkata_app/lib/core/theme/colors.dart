import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors (Premium Heritage)
  static const Color primaryNavy = Color(0xFF1A237E); // Deep Navy Blue
  static const Color primaryNavyLight = Color(0xFFE8EAF6); // Lighter Navy
  static const Color deepNavy = Color(0xFF0A192F); // Gojo Deep Navy
  static const Color navy800 = Color(0xFF112240); // Gojo Navy 800
  static const Color primaryGold = Color(0xFFD4AF37); // Gojo Gold
  static const Color primaryGoldLight = Color(0xFFFFF9C4); // Lighter Gold

  // Secondary & Accent Colors
  static const Color secondaryBrown = Color(0xFF8B4513); // Thatch Brown
  static const Color accentGold = Color(
    0xFFFFB300,
  ); // Darker Gold for hover/states

  // Neutral Colors
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color offWhite = Color(0xFFF5F5F5);
  static const Color bgLight = Color(0xFFF8F9FA); // Gojo Background Light
  static const Color softGrey = Color(0xFFE0E0E0); // Input backgrounds
  static const Color mediumGrey = Color(0xFF9E9E9E); // Placeholder/Subtitles
  static const Color darkGrey = Color(0xFF424242); // Main body text

  // Functional Colors
  static const Color errorRed = Color(0xFFD32F2F);
  static const Color errorRedLight = Color(0xFFFFEBEE);
  static const Color successGreen = Color(0xFF388E3C);
  static const Color successGreenLight = Color(0xFFE8F5E9);
  static const Color borderColor = Color(0xFFEEEEEE);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryNavy, Color(0xFF283593)], // Navy to slightly lighter Navy
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [primaryGold, Color(0xFFFFB300)], // Gold to darker Gold
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
