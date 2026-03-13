import 'package:flutter/material.dart';

class AppColors {
  // --- Brand Colors (Core identity) ---
  static const Color brandPrimary = Color(0xFF132E5F);
  static const Color brandPrimaryLight = Color(0xFFE8EAF6);
  static const Color brandPrimaryDark = Color(0xFF0A192F);
  static const Color brandGold = Color(0xFFD4AF37);
  static const Color brandGoldLight = Color(0xFFFFF9C4);
  static const Color brandGoldDark = Color(0xFFE3C567);
  static const Color brandSky = Color(0xFF1E425E);

  // --- Aliases for Brand Colors ---
  static const Color primaryNavy = brandPrimary;
  static const Color primaryNavyLight = brandPrimaryLight;
  static const Color deepNavy = brandPrimaryDark;
  static const Color primaryGold = brandGold;
  static const Color primaryGoldLight = brandGoldLight;
  static const Color goldDark = brandGoldDark;
  static const Color skyGradientEnd = brandSky;
  static const Color navy800 = Color(0xFF112240);

  // --- Neutrals & Backgrounds ---
  static const Color background = Color(0xFFF8F9FA);
  static const Color bgLight = background;
  static const Color backgroundDark = Color(0xFF0D1117);
  static const Color bgDark = backgroundDark;
  static const Color surface = Color(0xFFFFFFFF);
  static const Color pureWhite = surface;
  static const Color offWhite = Color(0xFFF5F5F5);
  static const Color surfaceSecondary = Color(0xFFF1F5F9);
  static const Color smokeWhite = surfaceSecondary;
  static const Color borderColor = Color(0xFFEEEEEE);
  static const Color border = borderColor;
  static const Color softGrey = Color(0xFFE0E0E0);
  static const Color mediumGrey = Color(0xFF9E9E9E);
  static const Color textSecondary = mediumGrey;
  static const Color darkGrey = Color(0xFF424242);
  static const Color textPrimary = darkGrey;

  // --- Secondary & Accent Colors ---
  static const Color secondaryBrown = Color(0xFF8B4513);
  static const Color accentGold = Color(0xFFFFB300);
  static const Color charcoal = Color(0xFF1F2937);
  static const Color slate = Color(0xFF475569);
  static const Color lightGreySurface = Color(0xFFF3F4F6);
  static const Color peachBg = Color(0xFFFFF7ED);

  // --- Dark Mode Palette ---
  static const Color surfaceDark = Color(0xFF161B22);
  static const Color surfaceDarkElevated = Color(0xFF21262D);
  static const Color inputDark = Color(0xFF0D1117);
  static const Color borderDark = Color(0xFF30363D);
  static const Color onDarkPrimary = Color(0xFFE6EDF3);
  static const Color textPrimaryDark = onDarkPrimary;
  static const Color onDarkSecondary = Color(0xFF8B949E);
  static const Color textSecondaryDark = onDarkSecondary;
  static const Color onDarkDisabled = Color(0xFF484F58);
  static const Color chipDark = Color(0xFF21262D);
  static const Color darkScrim = Color(0xB3000000);
  static const Color pureBlack = Color(0xFF000000);
  static const Color darkOverlay = Color(0x80000000);

  // --- Functional Colors ---
  static const Color successGreen = Color(0xFF388E3C);
  static const Color successGreenLight = Color(0xFFE8F5E9);
  static const Color warningOrange = Color(0xFFF5B000);
  static const Color warningOrangeLight = Color(0xFFFFF3E0);
  static const Color errorRed = Color(0xFFD32F2F);
  static const Color error = errorRed;
  static const Color errorRedLight = Color(0xFFE0BEC3);
  static const Color errorLight = errorRedLight;
  static const Color infoBlue = Color(0xFF1976D2);
  static const Color infoBlueLight = Color(0xFFE3F2FD);

  // --- Gradients ---
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [brandPrimary, brandSky],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [brandGold, Color(0xFFFFB300)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
