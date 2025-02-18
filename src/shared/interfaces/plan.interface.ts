export interface Plan {
  id: string;
  name: string;
  price: number;
  stripePriceId: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    stripePriceId: 'price_basic',
    features: ['Feature 1', 'Feature 2'],
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 19.99,
    stripePriceId: 'price_standard',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 29.99,
    stripePriceId: 'price_premium',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
  },
];
