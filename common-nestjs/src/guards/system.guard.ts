import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SystemGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const bearerHeader = context.switchToHttp().getRequest().headers.authorization;
    return bearerHeader && bearerHeader.split(' ')[1] === process.env.SYSTEM_API_SECRET;
  }
}
 