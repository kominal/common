import { createParamDecorator } from '@nestjs/common';

export class UserContext {
  public userId: string;
  public accessTokenId?: string;
  public email: string;
  public admin: boolean;
}

export const UserCtx = createParamDecorator<never, UserContext>((_, context) => {
  return context.switchToHttp().getRequest().userContext as UserContext;
});
