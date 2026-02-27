import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './decorators/pubilc.decorator';
import { AuthService } from './auth.service';

const userKey = 'user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    // console.log('token', token);
    if (!token) {
      throw new UnauthorizedException('token 不能为空');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // console.log('payload', payload);
      const { id } = payload;
      const isOnline = await this.authService.selectUserOnline(id);
      if (!isOnline) {
        throw new UnauthorizedException('该用户不在线，发送错误');
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request[userKey] = payload;
    } catch (err) {
      if (err.name === 'TokenExpiredError' && err.message === 'jwt expired') {
        // token 过期了
        const deconde: any = await this.jwtService.decode(token);
        console.log('token 过期了', deconde);
        if (deconde.id) {
          this.authService.loginOut(deconde.id);
        }
        throw new UnauthorizedException('token 已过期');
      }
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// 为 request['user'] 新建一个装饰器 User
export const decoratorUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[userKey];
  },
);
