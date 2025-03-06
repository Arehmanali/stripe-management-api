import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PlansService } from '../plans/plans.service';

import { Subscription } from '@/shared/interfaces/subscription.interface';
import { Payment, PaymentRepository } from './repositories/payment.repository';
import { SubscriptionRepository } from './repositories/subscriptions.respository';
import { createLogger } from '@/shared/logger/logger';
import * as dotenv from 'dotenv';
import { StripeWebhookEvents } from './dto/create-checkout-session.dto';

dotenv.config();

@Injectable()
export class SubscriptionsService {
  private readonly logger = createLogger(SubscriptionsService.name);

  constructor(
    private plansService: PlansService,
    private paymentRepository: PaymentRepository,
    private subscriptionRepository: SubscriptionRepository,
    private stripe: Stripe,
  ) {}

  /**
   * Creates a checkout session for the user.
   * @param {string} userId - The user ID.
   * @param {string} planId - The plan ID.
   * @returns {Promise<{ sessionId: string }>} The session ID for the checkout.
   */
  async createCheckoutSession(userId: string, planId: string) {
    const plan = await this.plansService.getPlanById(planId);
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
        userId,
      },
    });

    return { sessionId: session.id };
  }

  /**
   * Handles Stripe webhook events.
   * @param {string} signature - The Stripe webhook signature.
   * @param {Buffer} payload - The raw event payload.
   * @returns {Promise<{ received: boolean }>} Confirmation of received event.
   */
  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      switch (event.type) {
        case StripeWebhookEvents.CheckoutSessionCompleted: {
          const session = event.data.object;
          await this.subscriptionRepository.createSubscription(
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
          } as Payment);

          break;
        }
        case StripeWebhookEvents.CustomerSubscriptionDeleted: {
          const subscription = event.data.object;
          await this.subscriptionRepository.cancelSubscription(subscription.id);
          break;
        }
      }

      return { received: true };
    } catch (err) {
      this.logger.error('Error processing webhook:', err);
      throw err;
    }
  }

  /**
   * Gets the user's active subscription.
   * @param {string} userId - The user ID.
   * @returns {Promise<Subscription | null>} The user's active subscription or null.
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.getUserSubscription(userId);
  }

  /**
   * Gets all subscriptions.
   * @returns {Promise<Subscription[]>} List of all subscriptions.
   */
  async getAllSubscriptions(): Promise<Subscription[]> {
    return await this.subscriptionRepository.getAllSubscriptions();
  }

  /**
   * Cancels a subscription using the Stripe subscription ID.
   * @param {string} stripeSubscriptionId - The Stripe subscription ID.
   * @returns {Promise<void>}
   */
  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    await this.subscriptionRepository.cancelSubscription(stripeSubscriptionId);
  }
}
