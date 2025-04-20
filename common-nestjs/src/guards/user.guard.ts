import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 } from 'uuid';
import { Membership, MembershipModel, MembershipStatus } from '../entities/membership.entity';
import { User, UserModel } from '../entities/user.entity';
import { UserContext } from '../helpers/context.decorator';
import { AuthService } from '../services/auth.service';

@Injectable()
export class UserGuard implements CanActivate {
  public constructor(
    @InjectModel(Membership.name) private membershipModel: MembershipModel,
    @InjectModel(User.name) private userModel: UserModel,
    private authService: AuthService,
  ) {}

  public async populateUserContext(context: ExecutionContext): Promise<UserContext | undefined> {
    const req = context.switchToHttp().getRequest();

    const claims = await this.authService.getClaims(req.headers.authorization);

    if (!claims) {
      return undefined;
    }

    const userContext: UserContext = {
      userId: claims.sub,
      email: claims.email,
      admin: claims.admin || false,
    };
    req.userContext = userContext;

    await this.userModel.updateOne(
      { userId: userContext.userId },
      {
        lastActivity: new Date(),
        $setOnInsert: {
          uuid: v4(),
          createdAt: new Date(),
          createdBy: userContext.email,
          updatedAt: new Date(),
          updatedBy: userContext.email,
        },
      },
      { upsert: true },
    );

    const invitations = await this.membershipModel.find({ email: userContext.email, status: MembershipStatus.INVITED });
    await Promise.all(invitations.map(async (invitation) => invitation.updateOne({ userId: userContext.userId, status: MembershipStatus.ACTIVE })));

    return userContext;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const userContext = await this.populateUserContext(context);
    return !!userContext;
  }
}
