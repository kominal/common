import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccessToken, AccessTokenModel } from '../entities/access-token.entity';
import { Membership, MembershipModel } from '../entities/membership.entity';
import { UserContext } from '../helpers/context.decorator';
import { UserGuard } from './user.guard';

@Injectable()
export class TenantGuard implements CanActivate {
  public constructor(
    @InjectModel(Membership.name) private membershipModel: MembershipModel,
    @InjectModel(AccessToken.name) private accessTokenModel: AccessTokenModel,
    private userGuard: UserGuard,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const { tenantId } = req.params;

    if (!tenantId) {
      return false;
    }

    const bearerHeader = req.headers.authorization;

    if (!bearerHeader) {
      return false;
    }

    const [type, token] = bearerHeader.split(' ');

    if (type === 'Bearer') {
      const userContext = await this.userGuard.populateUserContext(context);

      if (!userContext) {
        return false;
      }

      if (userContext.admin) {
        return true;
      }

      await this.membershipModel.exists({ tenantId, userId: userContext.userId }).orFail(new HttpException('exception.notFound', 404));

      return true;
    }

    if (type === 'AccessToken') {
      const { userId, uuid } = await this.accessTokenModel.findOne({ tenantId, token }).orFail(new HttpException('exception.notFound', 404));
      const { email } = await this.membershipModel.findOne({ tenantId, userId }).orFail(new HttpException('exception.notFound', 404));

      const userContext: UserContext = {
        userId,
        accessTokenId: uuid,
        email,
        admin: false,
      };
      req.userContext = userContext;

      return true;
    }

    return false;
  }
}
