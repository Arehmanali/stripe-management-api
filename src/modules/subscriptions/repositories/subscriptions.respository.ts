import { Subscription } from '@/shared/interfaces/subscription.interface';
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class SubscriptionRepository {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Creates a new subscription in Firestore.
   * @param {string} userId - The user ID.
   * @param {string} planId - The plan ID.
   * @param {string} stripeSubscriptionId - The Stripe subscription ID.
   * @returns {Promise<Subscription>} The created subscription.
   */
  async createSubscription(
    userId: string,
    planId: string,
    stripeSubscriptionId: string,
  ): Promise<Subscription> {
    const docRef = await this.db.collection('subscriptions').add({
      userId,
      planId,
      stripeSubscriptionId,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Subscription;
  }

  /**
   * Retrieves the active subscription for a user by user ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<Subscription | null>} The active subscription or null.
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const snapshot = await this.db
      .collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Subscription;
  }

  /**
   * Retrieves all subscriptions.
   * @returns {Promise<Subscription[]>} List of all subscriptions.
   */
  async getAllSubscriptions(): Promise<Subscription[]> {
    const snapshot = await this.db.collection('subscriptions').get();
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Subscription,
    );
  }

  /**
   * Cancels a subscription by its Stripe subscription ID.
   * @param {string} stripeSubscriptionId - The Stripe subscription ID.
   * @returns {Promise<void>}
   */
  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    const snapshot = await this.db
      .collection('subscriptions')
      .where('stripeSubscriptionId', '==', stripeSubscriptionId)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
}
