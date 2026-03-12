interface PasswordValidationOptions {
  /** Minimum password length (default: 8) */
  minLength?: number;
  /** Maximum password length (default: 24) */
  maxLength?: number;
  /** Regex for allowed characters (default: /^[a-z\\d.,@$!%*#?&]*$/i) */
  allowedChars?: RegExp;
  /** Human-readable error message for restricted characters */
  allowedCharsDescription?: string;
  /** Whether to require a confirmation password match (default: false) */
  requireConfirm?: boolean;
}
