import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthCredentialsDTO, LoginResponseDTO } from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthCredentialsDTO })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: LoginResponseDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async signup(
    @Body() credentials: AuthCredentialsDTO,
  ): Promise<LoginResponseDTO> {
    await this.usersService.createUser(credentials.email, credentials.password);
    return this.authService.login(credentials.email, credentials.password);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: AuthCredentialsDTO })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDTO,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() credentials: AuthCredentialsDTO,
  ): Promise<LoginResponseDTO> {
    return this.authService.login(credentials.email, credentials.password);
  }
}
