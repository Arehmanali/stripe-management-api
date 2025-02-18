import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces/user.interface';
import { UserRepository } from './users.repository';

/**
 * Service for managing user-related operations.
 */
@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Creates a new user with a hashed password.
   *
   * @param {string} email - The email address of the new user.
   * @param {string} password - The plain-text password of the new user.
   * @returns {Promise<User>} - The created user object.
   */
  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: '',
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
    };

    return this.userRepository.createUser(user);
  }

  /**
   * Finds a user by their email address.
   *
   * @param {string} email - The email address to search for.
   * @returns {Promise<User | null>} - The user object if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
