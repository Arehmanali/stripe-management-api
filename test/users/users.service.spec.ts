import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { UserRepository } from '../../src/modules/users/users.repository';
import { expect } from 'chai';
import sinon from 'sinon';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository;

  beforeEach(async () => {
    const repositoryStub = {
      createUser: sinon.stub(),
      findByEmail: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: repositoryStub,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const expectedUser = {
        id: '123',
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
      };

      sinon.stub(bcrypt, 'hash').resolves(hashedPassword);
      (repository.createUser as sinon.SinonStub).resolves(expectedUser);

      const result = await service.createUser(email, password);

      expect(result).to.deep.equal(expectedUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const expectedUser = {
        id: '123',
        email,
        password: 'hashedPassword',
        role: 'user',
        createdAt: new Date(),
      };

      (repository.findByEmail as sinon.SinonStub).resolves(expectedUser);

      const result = await service.findByEmail(email);

      expect(result).to.deep.equal(expectedUser);
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      
      (repository.findByEmail as sinon.SinonStub).resolves(null);

      const result = await service.findByEmail(email);

      expect(result).to.be.null;
    });
  });
}); 