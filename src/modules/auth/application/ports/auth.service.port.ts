/**
 * @interface UserPayload
 * @description Payload representing user data returned from auth service.
 */
export interface UserPayload {
  id: string;
  email: string;
  name: string;
  // include other fields if returned by auth verify, e.g., roles
}

/**
 * @interface VerifyUserResponse
 * @description Response structure from the auth service verify endpoint.
 */
export interface VerifyUserResponse {
  user: UserPayload;
  token: string; // Potentially refreshed token
}

/**
 * @interface AuthServicePort
 * @description Contract for communicating with the authentication service.
 */
export interface AuthServicePort {
  /**
   * Verifies a JWT token via the auth microservice.
   * @param {string} token - The JWT token to verify.
   * @returns {Promise<VerifyUserResponse>} User payload and potentially refreshed token.
   * @throws {RpcException} If token is invalid or communication fails.
   */
  verifyToken(token: string): Promise<VerifyUserResponse>;

  /**
   * Sends a registration request to the auth microservice.
   * @param {any} registerDto - Data for user registration.
   * @returns {Promise<any>} Response from the auth service (e.g., user and token).
   */
  register(registerDto: any): Promise<any>;

  /**
   * Sends a login request to the auth microservice.
   * @param {any} loginDto - User login credentials.
   * @returns {Promise<any>} Response from the auth service (e.g., user and token).
   */
  login(loginDto: any): Promise<any>;
}
