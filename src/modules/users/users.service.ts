import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { UserRepository } from './repositories/users.repository';
import { randomUUID } from 'crypto';
import { bcryptUtil } from '@/utils/bcrypt.util';
import { createLogger } from '@/shared/logger/logger';
import { UserRole } from '../auth/dto/auth.dto';

/**
 * Service for managing user-related operations.
 */
@Injectable()
export class UsersService {
  private readonly logger = createLogger(UsersService.name);

  constructor(private userRepository: UserRepository) {}

  /**
   * Creates a new user with a hashed password.
   *
   * @param {string} email - The email address of the new user.
   * @param {string} password - The plain-text password of the new user.
   * @returns {Promise<User>} - The created user object.
   */
  async createUser(email: string, password: string): Promise<User> {
    this.logger.log(`Creating user with email: ${email}`);
    try {
      const hashedPassword = await bcryptUtil.hash(password, 10);
      const user: User = {
        id: randomUUID(),
        email,
        password: hashedPassword,
        role: UserRole.USER,
      };

      const createdUser = await this.userRepository.createUser(user);
      this.logger.log(`User created successfully: ${createdUser.id}`);
      return createdUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error creating user: ${error.message}`, error.stack);
      } else {
        this.logger.error('Unknown error occurred while creating user');
      }
      throw error;
    }
  }

  /**
   * Finds a user by their email address.
   *
   * @param {string} email - The email address to search for.
   * @returns {Promise<User | null>} - The user object if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);

    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
      } else {
        this.logger.log(`User found: ${user.id}`);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error finding user: ${error.message}`, error.stack);
      }
      this.logger.error('Unknown error while finding the user');
      throw error;
    }
  }
}
