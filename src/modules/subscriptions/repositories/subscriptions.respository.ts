import { Subscription } from '@/shared/interfaces/subscription.interface';
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { SubscriptionStatus } from '../dto/create-checkout-session.dto';

const SUBSCRIPTION_COLLECTION_NAME = 'subscriptions';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly db: Firestore) {}

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
    const docRef = await this.db.collection(SUBSCRIPTION_COLLECTION_NAME).add({
      userId,
      planId,
      stripeSubscriptionId,
      status: SubscriptionStatus.Active,
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
      .collection(SUBSCRIPTION_COLLECTION_NAME)
      .where('userId', '==', userId)
      .where('status', '==', SubscriptionStatus.Active)
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
    const snapshot = await this.db
      .collection(SUBSCRIPTION_COLLECTION_NAME)
      .get();
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
   * @returns {Promise<Subscription>}
   */
  async cancelSubscription(
    stripeSubscriptionId: string,
  ): Promise<Subscription> {
    const snapshot = await this.db
      .collection(SUBSCRIPTION_COLLECTION_NAME)
      .where('stripeSubscriptionId', '==', stripeSubscriptionId)
      .where('status', '==', SubscriptionStatus.Active)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];

    // Update subscription status to 'Cancelled'
    await doc.ref.update({
      status: SubscriptionStatus.Cancelled,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await doc.ref.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Subscription;
  }
}
