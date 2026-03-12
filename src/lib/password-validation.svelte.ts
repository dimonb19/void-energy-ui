/* Reactive password validation factory.
 *
 * Returns a getter-backed object whose properties stay reactive via $derived.
 * Call at the top level of a component — do NOT destructure the return value.
 *
 * @example
 * let password = $state('');
 * let confirm = $state('');
 * const pv = createPasswordValidation(() => password, () => confirm, { requireConfirm: true });
 *
 * <PasswordMeter password={password} validation={pv} />
 * <PasswordChecklist password={password} validation={pv} />
 * <button disabled={!pv.isValid}>Submit</button>
 */

export function createPasswordValidation(
  getPassword: () => string,
  getConfirmPassword?: () => string,
  options: PasswordValidationOptions = {},
): PasswordValidationState {
  const {
    minLength = 8,
    maxLength = 24,
    allowedChars = /^[a-z\d.,@$!%*#?&]*$/i,
    allowedCharsDescription = 'Only letters, numbers, and .,@$!%*#?& are allowed',
    requireConfirm = false,
  } = options;

  // Character class checks
  const hasLower = $derived(/[a-z]/.test(getPassword()));
  const hasUpper = $derived(/[A-Z]/.test(getPassword()));
  const hasDigit = $derived(/\d/.test(getPassword()));
  const hasSpecial = $derived(/[.,@$!%*#?&]/.test(getPassword()));

  // Length and restriction checks
  const hasRestrictedChars = $derived(
    getPassword().length > 0 && !allowedChars.test(getPassword()),
  );
  const hasValidLength = $derived(
    getPassword().length >= minLength && getPassword().length <= maxLength,
  );

  // Confirm password match
  const passwordsMatch = $derived(
    requireConfirm
      ? (getConfirmPassword?.() ?? '').length > 0 &&
          getPassword() === (getConfirmPassword?.() ?? '')
      : true,
  );

  // Strength scoring (length-dominant: 0–80pts + variety: 0–20pts)
  const score = $derived.by(() => {
    const pw = getPassword();
    if (!pw) return 0;

    const len = pw.length;
    let lengthScore: number;
    if (len < 8) lengthScore = Math.floor(len * 2.5);
    else if (len < 12) lengthScore = 20 + (len - 8) * 5;
    else if (len < 16) lengthScore = 40 + (len - 12) * 5;
    else lengthScore = 60 + Math.min((len - 16) * 2, 20);

    const varietyScore =
      (hasLower ? 3 : 0) +
      (hasUpper ? 5 : 0) +
      (hasDigit ? 5 : 0) +
      (hasSpecial ? 7 : 0);

    return Math.min(lengthScore + varietyScore, 100);
  });

  const level: PasswordStrengthLevel = $derived(
    score < 40 ? 'weak' : score < 60 ? 'fair' : score < 80 ? 'good' : 'strong',
  );

  // Error message (restricted chars only — length/composition shown via checklist)
  const error = $derived(hasRestrictedChars ? allowedCharsDescription : '');

  // Pre-built rules array for PasswordChecklist
  const rules: PasswordRule[] = $derived([
    { label: `${minLength}–${maxLength} characters`, met: hasValidLength },
    { label: 'One lowercase letter', met: hasLower },
    { label: 'One uppercase letter', met: hasUpper },
    { label: 'One number', met: hasDigit },
    { label: 'One special character (.,@$!%*#?&)', met: hasSpecial },
    ...(requireConfirm
      ? [{ label: 'Passwords match', met: passwordsMatch }]
      : []),
  ]);

  // Aggregate validity
  const isValid = $derived(
    !hasRestrictedChars &&
      hasValidLength &&
      hasLower &&
      hasUpper &&
      hasDigit &&
      hasSpecial &&
      passwordsMatch,
  );

  // Getter-backed return preserves $derived reactivity
  return {
    get hasLower() {
      return hasLower;
    },
    get hasUpper() {
      return hasUpper;
    },
    get hasDigit() {
      return hasDigit;
    },
    get hasSpecial() {
      return hasSpecial;
    },
    get hasRestrictedChars() {
      return hasRestrictedChars;
    },
    get hasValidLength() {
      return hasValidLength;
    },
    get passwordsMatch() {
      return passwordsMatch;
    },
    get score() {
      return score;
    },
    get level() {
      return level;
    },
    get error() {
      return error;
    },
    get rules() {
      return rules;
    },
    get isValid() {
      return isValid;
    },
  };
}
