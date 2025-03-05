import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { toUserResponse } from './mapper/toUserResponse';
import { hashUtil } from '@/utils/hash.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Creates an instance of AuthService.
   * @param {UsersService} usersService - Service to handle user-related operations.
   * @param {JwtService} jwtService - Service to handle JWT generation and validation.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user by email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<Omit<User, 'password'> | null>} - Returns user object (without password) if credentials are valid, otherwise null.
   */
  async validateUser(email: string, password: string) {
    this.logger.debug(`Validating user: ${email}`);
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await hashUtil.compare(password, user.password))) {
      this.logger.warn(`Invalid credentials for user: ${email}`);
      return null;
    }

    const userResponse = toUserResponse(user);
    return userResponse;
  }

  /**
   * Authenticates a user and generates a JWT token.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<{ access_token: string }>} - Returns an access token if authentication is successful.
   * @throws {UnauthorizedException} - Throws an error if authentication fails.
   */
  async login(email: string, password: string) {
    this.logger.debug(`Attempting login for user: ${email}`);
    const user = await this.validateUser(email, password);

    if (!user) {
      this.logger.error(`Login failed for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.jwtService.sign({
      email: user.email,
      sub: user.id,
      role: user.role,
    });

    this.logger.log(`User logged in successfully: ${email}`);
    return { access_token };
  }
}
