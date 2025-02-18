import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { PlansService } from '../plans/plans.service';
import { Subscription } from '../../shared/interfaces/subscription.interface';
import { Payment, PaymentRepository } from './payment.repository';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;
  private db: FirebaseFirestore.Firestore;
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private plansService: PlansService,
    private paymentRepository: PaymentRepository,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    });
    this.db = admin.firestore();
  }

  async createCheckoutSession(userId: string, planId: string) {
    const plan = this.plansService.getPlanById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: userId,
      metadata: {
        planId,
      },
    });

    return { sessionId: session.id };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await this.createSubscription(
            session.client_reference_id,
            session.metadata.planId,
            session.subscription as string,
          );

          // Store the successful payment
          await this.paymentRepository.createPayment({
            userId: session.client_reference_id,
            planId: session.metadata.planId,
            status: 'successful',
            stripeSubscriptionId: session.subscription as string,
            createdAt: new Date(),
          } as Payment);

          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await this.cancelSubscription(subscription.id);
          break;
        }
      }

      return { received: true };
    } catch (err) {
      this.logger.error('Error processing webhook:', err);
      throw err;
    }
  }

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

  private async createSubscription(
    userId: string,
    planId: string,
    stripeSubscriptionId: string,
  ): Promise<void> {
    await this.db.collection('subscriptions').add({
      userId,
      planId,
      stripeSubscriptionId,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

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
