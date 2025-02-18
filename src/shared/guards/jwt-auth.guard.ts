import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Creates an instance of JwtAuthGuard.
   * @param {Reflector} reflector - The NestJS Reflector used to read metadata.
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the current request can proceed based on authentication.
   * If the route is marked as public, it bypasses authentication.
   *
   * @param {ExecutionContext} context - The execution context of the request.
   * @returns {boolean | Promise<boolean> | Observable<boolean>} - Returns `true` if the route is public, otherwise delegates authentication to Passport.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handles the authentication request and ensures a valid user object is returned.
   * Throws an UnauthorizedException if authentication fails.
   *
   * @param {unknown} err - Any error encountered during authentication.
   * @param {unknown} user - The authenticated user, or null if authentication failed.
   * @returns {TUser} - The authenticated user.
   */
  handleRequest<TUser = any>(err: unknown, user: unknown): TUser {
    if (err || !user || typeof user !== 'object' || !('id' in user)) {
      throw err || new UnauthorizedException();
    }
    return user as TUser;
  }
}
