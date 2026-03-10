import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTheme {
  // ===========================================================================
  // LIGHT THEME
  // ===========================================================================
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.deepNavy,
      scaffoldBackgroundColor: AppColors.bgLight,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        // Primary brand → navy
        primary: AppColors.deepNavy,
        onPrimary: AppColors.pureWhite,
        primaryContainer: AppColors.primaryNavyLight,
        onPrimaryContainer: AppColors.deepNavy,
        // Secondary brand → gold
        secondary: AppColors.primaryGold,
        onSecondary: AppColors.pureWhite,
        secondaryContainer: AppColors.primaryGoldLight,
        onSecondaryContainer: AppColors.deepNavy,
        // Tertiary (unused, safe fallback)
        tertiary: AppColors.accentGold,
        onTertiary: AppColors.pureWhite,
        tertiaryContainer: AppColors.primaryGoldLight,
        onTertiaryContainer: AppColors.deepNavy,
        // Error
        error: AppColors.errorRed,
        onError: AppColors.pureWhite,
        errorContainer: AppColors.errorRedLight,
        onErrorContainer: AppColors.errorRed,
        // Surfaces
        surface: AppColors.pureWhite,
        onSurface: AppColors.charcoal,
        surfaceContainerHighest: AppColors.lightGreySurface,
        onSurfaceVariant: AppColors.slate,
        // Outline
        outline: AppColors.borderColor,
        outlineVariant: AppColors.softGrey,
        // Scrim / shadow
        scrim: AppColors.darkOverlay,
        shadow: AppColors.pureBlack,
        // Inverse
        inverseSurface: AppColors.charcoal,
        onInverseSurface: AppColors.pureWhite,
        inversePrimary: AppColors.primaryNavyLight,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: AppColors.darkGrey,
        displayColor: AppColors.deepNavy,
        decorationColor: AppColors.mediumGrey,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: AppColors.pureWhite,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      dividerTheme: const DividerThemeData(color: AppColors.borderColor),
      iconTheme: const IconThemeData(color: AppColors.slate),
      useMaterial3: true,
    );
  }

  // ===========================================================================
  // DARK THEME
  // Uses a GitHub-inspired dark palette: very dark backgrounds, gold accents,
  // soft off-white text — no auto-generated colors from fromSeed.
  // ===========================================================================
  static ThemeData get darkTheme {
    return ThemeData(
      primaryColor: AppColors.goldDark,
      scaffoldBackgroundColor: AppColors.bgDark,
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        // Primary brand → bright gold (readable on dark)
        primary: AppColors.goldDark,
        onPrimary: AppColors.pureBlack,
        primaryContainer: AppColors.surfaceDarkElevated,
        onPrimaryContainer: AppColors.goldDark,
        // Secondary → muted amber
        secondary: AppColors.accentGold,
        onSecondary: AppColors.pureBlack,
        secondaryContainer: AppColors.chipDark,
        onSecondaryContainer: AppColors.onDarkPrimary,
        // Tertiary → subtle warm tone
        tertiary: AppColors.onDarkSecondary,
        onTertiary: AppColors.bgDark,
        tertiaryContainer: AppColors.surfaceDark,
        onTertiaryContainer: AppColors.onDarkPrimary,
        // Error
        error: Color(0xFFFF6B6B),
        onError: AppColors.pureBlack,
        errorContainer: Color(0xFF5C2323),
        onErrorContainer: Color(0xFFFFB3B3),
        // Surfaces
        surface: AppColors.surfaceDark,
        onSurface: AppColors.onDarkPrimary,
        surfaceContainerHighest: AppColors.surfaceDarkElevated,
        onSurfaceVariant: AppColors.onDarkSecondary,
        // Outline
        outline: AppColors.borderDark,
        outlineVariant: AppColors.onDarkDisabled,
        // Scrim / shadow
        scrim: AppColors.darkScrim,
        shadow: AppColors.pureBlack,
        // Inverse (Snackbars, tooltips)
        inverseSurface: AppColors.onDarkPrimary,
        onInverseSurface: AppColors.bgDark,
        inversePrimary: AppColors.primaryNavy,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: AppColors.onDarkPrimary,
        displayColor: AppColors.onDarkPrimary,
        decorationColor: AppColors.onDarkSecondary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceDark,
        foregroundColor: AppColors.onDarkPrimary,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: const CardThemeData(
        color: AppColors.surfaceDarkElevated,
        elevation: 0,
        margin: EdgeInsets.zero,
      ),
      dividerTheme: const DividerThemeData(color: AppColors.borderDark),
      iconTheme: const IconThemeData(color: AppColors.onDarkSecondary),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected)
              ? AppColors.goldDark
              : AppColors.onDarkSecondary,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected)
              ? AppColors.goldDark.withValues(alpha: 0.4)
              : AppColors.borderDark,
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.inputDark,
        border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.goldDark),
        ),
        hintStyle: TextStyle(color: AppColors.onDarkSecondary),
        labelStyle: TextStyle(color: AppColors.onDarkSecondary),
      ),
      useMaterial3: true,
    );
  }
}
