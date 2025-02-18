import { PaymentRepository } from '../../src/modules/subscriptions/payment.repository';
import { expect } from 'chai';
import sinon from 'sinon';
import * as admin from 'firebase-admin';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let firestoreStub: any;

  beforeEach(() => {
    firestoreStub = {
      collection: sinon.stub().returnsThis(),
      add: sinon.stub(),
      doc: sinon.stub().returnsThis(),
      get: sinon.stub(),
      update: sinon.stub(),
    };

    sinon.stub(admin, 'firestore').returns(firestoreStub);
    repository = new PaymentRepository();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const paymentData = {
        userId: 'user123',
        amount: 9.99,
        status: 'successful',
      };

      firestoreStub.add.resolves({ id: 'payment123' });

      await repository.createPayment(paymentData);
    });

    it('should handle errors when creating payment', async () => {
      const paymentData = {
        userId: 'user123',
        amount: 9.99,
      };

      firestoreStub.add.rejects(new Error('Firestore error'));

      try {
        await repository.createPayment(paymentData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to create payment');
      }
    });
  });
});
