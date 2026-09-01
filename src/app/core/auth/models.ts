/** Credentials (including the captcha answer) submitted by the login form. */
export interface LoginRequest {
  userName: string;
  password: string;
  captcha: string;
}

/**
 * Token payload persisted through `@delon/auth`'s `DA_SERVICE_TOKEN` after a successful login.
 * `expired` is epoch milliseconds; the mock issues a short-lived token the same way a real
 * backend's access-token TTL would.
 */
export interface AuthToken {
  token: string;
  name: string;
  email: string;
  id: number;
  expired?: number;
}

/** Uniform envelope every mock authentication endpoint answers with. */
export interface AuthResponse {
  msg: string;
  user?: AuthToken;
}

/**
 * Payload of `GET /captcha`. A real captcha service returns an image reference (base64/SVG/URL);
 * the mock already renders the SVG server-side, so the client can display it as-is.
 */
export interface CaptchaResponse {
  image: string;
}

/** Raised when the API rejects a login attempt; `message` carries the displayable Persian text. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
