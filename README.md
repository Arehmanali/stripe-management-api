# Subscription Management API

A NestJS-based API for managing subscriptions and payments using Stripe.

## Features

- User Authentication with JWT
- Role-based Access Control
- Subscription Management
- Payment Processing with Stripe
- Swagger API Documentation
- Firebase Integration
- Automated Testing

## Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- Stripe Account
- Firebase Account

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd subscription-management-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Variables**

Create a `.env` file in the root directory with the following variables:

```env
# App
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

4. **Start the application**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

The API documentation is available at `http://localhost:3000/api-docs` when the application is running.

### Key Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /subscriptions/checkout` - Create a subscription checkout session
- `GET /subscriptions/all` - Get all subscriptions (admin only)
- `POST /subscriptions/cancel/:subscriptionId` - Cancel a subscription

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Stripe Test Cards

Use these test card numbers for testing payments:

- Successful payment: `4242 4242 4242 4242`
- Payment requires authentication: `4000 0025 0000 3155`
- Payment declined: `4000 0000 0000 9995`

Test card details:

- Expiry date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Subscription Plans

Available subscription plans:

| Plan     | Price (USD) | Features                    |
| -------- | ----------- | --------------------------- |
| Basic    | $9.99/mo    | Basic features              |
| Standard | $19.99/mo   | Standard features + Basic   |
| Premium  | $29.99/mo   | Premium features + Standard |

## Development

### Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── plans/
│   └── subscriptions/
├── shared/
│   ├── guards/
│   ├── decorators/
│   └── interfaces/
└── utils/
```

### Adding New Features

1. Create a new module:

```bash
nest generate module new-feature
```

2. Create controller and service:

```bash
nest generate controller new-feature
nest generate service new-feature
```

## Deployment

1. Build the application:

```bash
npm run build
```

2. Set production environment variables

3. Start the application:

```bash
npm run start:prod
```
