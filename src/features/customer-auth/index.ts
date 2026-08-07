/**
 * Customer authentication feature exports.
 */

export { customerSignInAction, type CustomerSignInActionResult } from './actions/sign-in';
export { customerSignOutAction } from './actions/sign-out';
export { customerSignUpAction, type CustomerSignUpActionResult } from './actions/sign-up';
export { CustomerAccountMenu } from './components/customer-account-menu';
export { CustomerAuthPanel } from './components/customer-auth-panel';
export { CustomerLoginForm } from './components/customer-login-form';
export { CustomerSignupForm } from './components/customer-signup-form';
export { PasswordStrength } from './components/password-strength';
export { evaluatePasswordStrength, PASSWORD_CRITERIA } from './lib/password-strength';
export {
  customerPasswordSchema,
  customerSignUpSchema,
  signInCredentialsSchema,
  type CustomerSignUpInput,
  type SignInCredentials,
} from './validations/credentials';
