import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';
import { bcryptUtil } from '@/utils/bcrypt.util';
import { UserRole } from '@/modules/auth/dto/auth.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: sinon.SinonStubbedInstance<UsersService>;
  let jwtService: sinon.SinonStubbedInstance<JwtService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: sinon.stub(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: sinon.stub(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get(
      UsersService,
    ) as sinon.SinonStubbedInstance<UsersService>;
    jwtService = moduleRef.get(
      JwtService,
    ) as sinon.SinonStubbedInstance<JwtService>;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should validate user with correct credentials', async () => {
    const now = new Date();
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.USER,
      createdAt: now,
    };

    usersService.findByEmail.resolves(user);
    sinon.stub(bcryptUtil, 'compare').resolves(true);

    const result = await authService.validateUser(
      'test@example.com',
      'password',
    );

    expect(result).to.deep.equal({
      id: '123',
      email: 'test@example.com',
      role: UserRole.USER,
      createdAt: now,
    });
    expect(usersService.findByEmail.calledOnceWith('test@example.com')).to.be
      .true;
  });

  it('should return null if user is not found', async () => {
    usersService.findByEmail.resolves(null);

    const result = await authService.validateUser(
      'notfound@example.com',
      'password',
    );

    expect(result).to.be.null;
  });

  it('should return null if password does not match', async () => {
    const now = new Date();
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.USER,
      createdAt: now,
    };

    usersService.findByEmail.resolves(user);
    sinon.stub(bcryptUtil, 'compare').resolves(false);

    const result = await authService.validateUser(
      'test@example.com',
      'wrongpassword',
    );

    expect(result).to.be.null;
  });

  it('should throw UnauthorizedException if login fails', async () => {
    usersService.findByEmail.resolves(null);

    try {
      await authService.login('invalid@example.com', 'wrongpassword');
      expect.fail('Expected UnauthorizedException');
    } catch (error) {
      expect(error).to.be.instanceOf(UnauthorizedException);
      expect(error.message).to.equal('Invalid credentials or user not found');
    }
  });

  it('should return access token if login is successful', async () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.USER,
      createdAt: new Date(),
    };

    usersService.findByEmail.resolves(user);
    sinon.stub(bcryptUtil, 'compare').resolves(true);
    jwtService.sign.returns('mocked-jwt-token');

    const result = await authService.login('test@example.com', 'password');

    expect(result).to.deep.equal({ access_token: 'mocked-jwt-token' });
    expect(jwtService.sign.calledOnce).to.be.true;
  });
});
