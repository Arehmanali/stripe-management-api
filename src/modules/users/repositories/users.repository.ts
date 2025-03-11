import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const USER_COLLECTION_NAME = 'users';

/**
 * Repository for managing users in Firestore.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly db: Firestore) {}

  /**
   * Creates a new user in Firestore.
   * Checks if the user already exists by email. If so, throws a conflict error.
   * @param {User} user - The user object to be created.
   * @returns {Promise<User>} The created user with its ID.
   */
  async createUser(user: User): Promise<User> {
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    await this.db
      .collection(USER_COLLECTION_NAME)
      .doc(user.id)
      .set({
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return user;
  }

  /**
   * Finds a user by email.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<User | null>} The user object or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.db
      .collection(USER_COLLECTION_NAME)
      .where('email', '==', email)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as User;
  }
}
