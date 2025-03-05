import { Provider } from '@nestjs/common';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

export const StripeProvider: Provider<Stripe> = {
  provide: Stripe,
  useFactory: () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    });
  },
};
