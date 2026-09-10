export const PASSWORD_VALIDATION_MESSAGE =
  "Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.";

export const isStrongPassword = (password: string): boolean =>
  /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#^()~])/.test(password);
