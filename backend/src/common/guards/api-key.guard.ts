import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Lightweight shared-secret check for the MVP.
 * The dashboard frontend sends: x-api-key: <DASHBOARD_API_KEY>
 * Good enough for a single pilot business; swap for real auth (JWT/session)
 * before this becomes multi-tenant.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.header('x-api-key');
    const expectedKey = this.configService.get<string>('dashboardApiKey');

    if (!expectedKey) {
      // Misconfiguration — fail closed rather than open.
      throw new UnauthorizedException('Dashboard API key is not configured on the server');
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
