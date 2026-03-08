import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.deepNavy,
      scaffoldBackgroundColor: AppColors.bgLight,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryGold,
        primary: AppColors.deepNavy,
        secondary: AppColors.primaryGold,
        surface: AppColors.pureWhite,
        error: AppColors.errorRed,
        onPrimary: AppColors.pureWhite,
        onSecondary: AppColors.deepNavy,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
        bodyColor: AppColors.darkGrey,
        displayColor: AppColors.deepNavy,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryNavy,
        foregroundColor: AppColors.pureWhite,
        elevation: 0,
      ),
      useMaterial3: true,
    );
  }
}
