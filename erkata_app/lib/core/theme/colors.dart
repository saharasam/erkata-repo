import 'package:flutter/material.dart';

class AppColors {
  // --- Brand Colors (Core identity) ---
  // Affects: Headere, Primary Buttons, Active States, App Bar
  static const Color primaryNavy = Color.fromARGB(255, 19, 46, 95);
  // Affects: Backgrounds of selected items, light backgrounds for navy elements
  static const Color primaryNavyLight = Color(0xFFE8EAF6);
  // Affects: Deep background elements, primary text in high-contrast areas
  static const Color deepNavy = Color(0xFF0A192F);
  // Affects: Dark mode backgrounds, cards in dark mode
  static const Color navy800 = Color(0xFF112240);
  // Affects: Primary CTA buttons (Continue, Submit), Highlights, Step Indicators
  static const Color primaryGold = Color(0xFFD4AF37);
  // Affects: Light highlights, backgrounds for gold elements
  static const Color primaryGoldLight = Color(0xFFFFF9C4);
  // Affects: Gradient endings, deep blue accents
  static const Color skyGradientEnd = Color(0xFF1E425E);

  // --- Secondary & Accent Colors ---
  // Affects: Specific decorative elements, historical/heritage accents
  static const Color secondaryBrown = Color(0xFF8B4513);
  // Affects: Hover states for gold buttons, active toggles
  static const Color accentGold = Color(0xFFFFB300);

  // --- Neutrals & Backgrounds ---
  // Affects: App-wide background color
  static const Color bgLight = Color(0xFFF8F9FA);
  // Affects: Card backgrounds, clean surfaces
  static const Color pureWhite = Color(0xFFFFFFFF);
  // Affects: Page backgrounds, grouped section backgrounds
  static const Color offWhite = Color(0xFFF5F5F5);
  // Affects: Input field backgrounds, disabled state containers
  static const Color softGrey = Color(0xFFE0E0E0);
  // Affects: Placeholder text, secondary icons, unselected states
  static const Color mediumGrey = Color(0xFF9E9E9E);
  // Affects: Main body text, primary icons
  static const Color darkGrey = Color(0xFF424242);
  // Affects: Borders, dividers, subtle separators
  static const Color borderColor = Color(0xFFEEEEEE);

  // --- Dark Mode Palette ---
  // Affects: Dark Mode scaffold/page background (deepest layer)
  static const Color bgDark = Color(0xFF0D1117);
  // Affects: Dark Mode primary surface — Scaffold, cards most prominent layer
  static const Color surfaceDark = Color(0xFF161B22);
  // Affects: Dark Mode slightly elevated cards, drawers, sheets
  static const Color surfaceDarkElevated = Color(0xFF21262D);
  // Affects: Dark Mode input field backgrounds
  static const Color inputDark = Color(0xFF0D1117);
  // Affects: Dark Mode borders, dividers, separators
  static const Color borderDark = Color(0xFF30363D);
  // Affects: Primary text on dark surfaces
  static const Color onDarkPrimary = Color(0xFFE6EDF3);
  // Affects: Secondary/muted text on dark surfaces (placeholders, captions)
  static const Color onDarkSecondary = Color(0xFF8B949E);
  // Affects: Disabled text/icon on dark surfaces
  static const Color onDarkDisabled = Color(0xFF484F58);
  // Affects: Dark gold — primary brand accent on dark (lighter, more readable)
  static const Color goldDark = Color(0xFFE3C567);
  // Affects: Dark-mode icon containers and chip backgrounds
  static const Color chipDark = Color(0xFF21262D);
  // Affects: Overlay scrim behind modals/sheets in dark mode
  static const Color darkScrim = Color(0xB3000000);
  // Affects: High contrast label on gold buttons in dark mode
  static const Color pureBlack = Color(0xFF000000);
  // Affects: overlay containers
  static const Color darkOverlay = Color(0x80000000);

  // --- UI Specific Shades (Unifying hardcoded values) ---
  // Affects: High-emphasis text, dark card titles
  static const Color charcoal = Color(0xFF1F2937);
  // Affects: Label text in Auth, secondary descriptions
  static const Color slate = Color(0xFF475569);
  // Affects: Light grey surfaces in Profile/Settings
  static const Color lightGreySurface = Color(0xFFF3F4F6);
  // Affects: Background for input fields in Auth
  static const Color smokeWhite = Color(0xFFF1F5F9);
  // Affects: Soft orange background for agent features
  static const Color peachBg = Color(0xFFFFF7ED);

  // --- Functional Colors ---
  // Affects: Error messages, Delete buttons, validation failures
  static const Color errorRed = Color(0xFFD32F2F);
  static const Color errorRedLight = Color.fromARGB(255, 224, 190, 195);
  // Affects: Success messages, Completion states, Green badges
  static const Color successGreen = Color(0xFF388E3C);
  static const Color successGreenLight = Color(0xFFE8F5E9);
  // Affects: Warning states, Pending badges
  static const Color warningOrange = Color.fromARGB(255, 245, 176, 0);
  static const Color warningOrangeLight = Color(0xFFFFF3E0);
  // Affects: Info states, Status updates
  static const Color infoBlue = Color(0xFF1976D2);
  static const Color infoBlueLight = Color(0xFFE3F2FD);

  // --- Gradients ---
  // Affects: Hero sections, Main Dashboards
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryNavy, skyGradientEnd],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Affects: Premium CTA buttons
  static const LinearGradient goldGradient = LinearGradient(
    colors: [primaryGold, Color(0xFFFFB300)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
