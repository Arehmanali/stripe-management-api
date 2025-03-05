import { Injectable, ConflictException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from './interfaces/user.interface';

/**
 * Repository for managing users in Firestore.
 */
@Injectable()
export class UserRepository {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Creates a new user in Firestore.
   * Checks if the user already exists by email. If so, throws a conflict error.
   * @param {User} user - The user object to be created.
   * @returns {Promise<User>} The created user with its ID.
   */
  async createUser(user: User): Promise<User> {
    // Check if the user already exists
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    // If the user doesn't exist, create a new user
    const docRef = await this.db.collection('users').add(user);
    return { ...user, id: docRef.id };
  }

  /**
   * Finds a user by email.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<User | null>} The user object or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as User;
  }
}
