import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';

class CustomTextField extends StatefulWidget {
  final String label;
  final String placeholder;
  final bool isPassword;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final Iterable<String>? autofillHints;

  const CustomTextField({
    super.key,
    required this.label,
    required this.placeholder,
    this.isPassword = false,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.autofillHints,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  bool _obscureText = true;
  bool _showClearButton = false;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.isPassword;
    widget.controller?.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    widget.controller?.removeListener(_onTextChanged);
    super.dispose();
  }

  void _onTextChanged() {
    final showClear = widget.controller?.text.isNotEmpty ?? false;
    if (showClear != _showClearButton) {
      setState(() => _showClearButton = showClear);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors
                .brandPrimary, // Updated from charcoal to navy for brand consistency
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: widget.controller,
          obscureText: _obscureText,
          keyboardType: widget.keyboardType,
          autofillHints: widget.autofillHints,
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.darkGrey,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            hintText: widget.placeholder,
            hintStyle: TextStyle(
              color: AppColors.mediumGrey.withValues(alpha: 0.6),
              fontWeight: FontWeight.w400,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            suffixIcon: widget.isPassword
                ? IconButton(
                    icon: Icon(
                      _obscureText
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.mediumGrey,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _obscureText = !_obscureText),
                  )
                : (_showClearButton
                      ? IconButton(
                          icon: const Icon(
                            Icons.cancel,
                            color: AppColors.mediumGrey,
                            size: 20,
                          ),
                          onPressed: () => widget.controller?.clear(),
                        )
                      : null),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: AppColors.brandGold,
                width: 2,
              ),
            ),
            filled: true,
            fillColor: AppColors.pureWhite,
          ),
        ),
      ],
    );
  }
}
