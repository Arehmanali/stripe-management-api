import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  status: string;
  stripeSubscriptionId: string;
  createdAt: Date;
}

@Injectable()
export class PaymentRepository {
  private db: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(PaymentRepository.name);

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Creates a new payment record in Firestore.
   * @param {Payment} paymentData  - The payment data to be stored.
   */
  async createPayment(paymentData: Payment): Promise<void> {
    try {
      await this.db.collection('payments').add({
        ...paymentData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      this.logger.log(
        `Payment created successfully for user ${paymentData.userId}`,
      );
    } catch (error) {
      this.logger.error('Error creating payment', error);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Retrieves a payment by its ID.
   * @param {string} paymentId - The ID of the payment to retrieve.
   * @returns The payment data or null if not found.
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const doc = await this.db.collection('payments').doc(paymentId).get();
      if (!doc.exists) {
        this.logger.warn(`Payment with ID ${paymentId} not found`);
        return null;
      }
      this.logger.log(`Payment with ID ${paymentId} retrieved successfully`);
      return { id: doc.id, ...(doc.data() as Payment) };
    } catch (error) {
      this.logger.error(`Error retrieving payment with ID ${paymentId}`, error);
      throw new Error('Failed to retrieve payment');
    }
  }

  /**
   * Updates a payment's status.
   * @param {string} paymentId - The ID of the payment to update.
   * @param {string} status - The new status of the payment.
   */
  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    try {
      await this.db.collection('payments').doc(paymentId).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      this.logger.log(
        `Payment with ID ${paymentId} updated to status ${status}`,
      );
    } catch (error) {
      this.logger.error(`Error updating payment with ID ${paymentId}`, error);
      throw new Error('Failed to update payment status');
    }
  }
}
