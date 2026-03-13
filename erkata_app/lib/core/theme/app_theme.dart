import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTheme {
  // =====================================================
  // LIGHT THEME
  // =====================================================

  static ThemeData get lightTheme {
    const scheme = ColorScheme(
      brightness: Brightness.light,

      primary: AppColors.brandPrimary,
      onPrimary: Colors.white,
      primaryContainer: AppColors.brandPrimaryLight,
      onPrimaryContainer: AppColors.brandPrimaryDark,

      secondary: AppColors.brandGold,
      onSecondary: Colors.white,
      secondaryContainer: AppColors.brandGoldLight,
      onSecondaryContainer: AppColors.brandPrimaryDark,

      tertiary: AppColors.brandSky,
      onTertiary: Colors.white,
      tertiaryContainer: AppColors.surfaceSecondary,
      onTertiaryContainer: AppColors.textPrimary,

      error: AppColors.error,
      onError: Colors.white,
      errorContainer: AppColors.errorLight,
      onErrorContainer: AppColors.error,

      surface: AppColors.surface,
      onSurface: AppColors.textPrimary,

      surfaceContainerHighest: AppColors.surfaceSecondary,
      onSurfaceVariant: AppColors.textSecondary,

      outline: AppColors.border,
      outlineVariant: AppColors.border,

      shadow: Colors.black,
      scrim: Colors.black54,

      inverseSurface: AppColors.textPrimary,
      onInverseSurface: Colors.white,
      inversePrimary: AppColors.brandPrimaryLight,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      primaryColor: scheme.primary,
      scaffoldBackgroundColor: AppColors.background,

      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.brandPrimary,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),

      cardTheme: const CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
      ),

      dividerTheme: const DividerThemeData(color: AppColors.border),

      iconTheme: const IconThemeData(color: AppColors.textSecondary),

      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceSecondary,
        border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.brandPrimary),
        ),
      ),
    );
  }

  // =====================================================
  // DARK THEME
  // =====================================================

  static ThemeData get darkTheme {
    const scheme = ColorScheme(
      brightness: Brightness.dark,

      primary: AppColors.brandGold,
      onPrimary: Colors.black,
      primaryContainer: AppColors.surfaceDarkElevated,
      onPrimaryContainer: AppColors.brandGold,

      secondary: AppColors.brandGoldDark,
      onSecondary: Colors.black,
      secondaryContainer: AppColors.surfaceDarkElevated,
      onSecondaryContainer: AppColors.textPrimaryDark,

      tertiary: AppColors.brandSky,
      onTertiary: Colors.white,
      tertiaryContainer: AppColors.surfaceDark,
      onTertiaryContainer: AppColors.textPrimaryDark,

      error: AppColors.error,
      onError: Colors.black,
      errorContainer: Color(0xFF5C2323),
      onErrorContainer: Color(0xFFFFB3B3),

      surface: AppColors.surfaceDark,
      onSurface: AppColors.textPrimaryDark,

      surfaceContainerHighest: AppColors.surfaceDarkElevated,
      onSurfaceVariant: AppColors.textSecondaryDark,

      outline: AppColors.borderDark,
      outlineVariant: AppColors.borderDark,

      shadow: Colors.black,
      scrim: Colors.black87,

      inverseSurface: AppColors.textPrimaryDark,
      onInverseSurface: AppColors.backgroundDark,
      inversePrimary: AppColors.brandPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      primaryColor: scheme.primary,
      scaffoldBackgroundColor: AppColors.backgroundDark,

      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: AppColors.textPrimaryDark,
        displayColor: AppColors.textPrimaryDark,
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceDark,
        foregroundColor: AppColors.textPrimaryDark,
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

      iconTheme: const IconThemeData(color: AppColors.textSecondaryDark),

      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.brandGold),
        ),
      ),

      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected)
              ? AppColors.brandGold
              : AppColors.textSecondaryDark,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected)
              ? AppColors.brandGold.withValues(alpha: 0.4)
              : AppColors.borderDark,
        ),
      ),
    );
  }
}
