export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,128}$/;

export const OTP_REGEX = /^\d{6}$/;

export const AUTH_MESSAGES = {
  email: "Enter a valid email address.",
  passwordLogin: "Password is required.",
  passwordReset: "Password must be 8–128 characters with at least one letter and one number.",
  otp: "Enter a valid 6-digit OTP.",
};

export function validateEmail(value) {
  return EMAIL_REGEX.test(String(value || "").trim());
}

export function validateLoginPassword(value) {
  return String(value || "").length > 0;
}

export function validateResetPassword(value) {
  return PASSWORD_REGEX.test(String(value || ""));
}

export function validateOtp(value) {
  return OTP_REGEX.test(String(value || "").trim());
}

export function getLoginFieldErrors(email, password) {
  const errors = {};
  if (!validateEmail(email)) errors.email = AUTH_MESSAGES.email;
  if (!validateLoginPassword(password)) errors.password = AUTH_MESSAGES.passwordLogin;
  return errors;
}

export function getForgotEmailErrors(email) {
  const errors = {};
  if (!validateEmail(email)) errors.email = AUTH_MESSAGES.email;
  return errors;
}

export function getResetPasswordFieldErrors(otp, newPassword) {
  const errors = {};
  if (!validateOtp(otp)) errors.otp = AUTH_MESSAGES.otp;
  if (!validateResetPassword(newPassword)) errors.newPassword = AUTH_MESSAGES.passwordReset;
  return errors;
}
