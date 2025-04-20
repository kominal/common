import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserGuard } from './user.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  public constructor(private userGuard: UserGuard) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const userContext = await this.userGuard.populateUserContext(context);
    return !!userContext && userContext.admin;
  }
}
