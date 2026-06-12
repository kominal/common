import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 } from 'uuid';
import { Membership, MembershipCreateRequest, MembershipModel, MembershipStatus, MembershipUpdateRequest } from '../entities/membership.entity';
import { Tenant, TenantModel } from '../entities/tenant.entity';
import { User, UserModel } from '../entities/user.entity';
import { UserContext } from '../helpers/context.decorator';
import { EntitiesPathParams, EntityPathParams, ListParams, ListResponse } from '../helpers/entity-service.helper';

@Injectable()
export class MembershipService {
  public constructor(
    @InjectModel(Tenant.name) private tenantModel: TenantModel,
    @InjectModel(Membership.name) private membershipModel: MembershipModel,
    @InjectModel(User.name) private userModel: UserModel,
  ) {}

  public async create(userContext: UserContext, entitiesPathParams: EntitiesPathParams, membershipCreateRequest: MembershipCreateRequest): Promise<void> {
    const email = membershipCreateRequest.email.toLocaleLowerCase();

    const tenant = await this.tenantModel.findOne({ uuid: entitiesPathParams.tenantId }).orFail(new HttpException('Tenant not found', 404));

    const users = await this.userModel.find({ email });

    if (users.length > 0) {
      for (const user of users) {
        await this.membershipModel.updateOne(
          { tenantId: tenant.uuid, userId: user.userId },
          {
            email,
            status: MembershipStatus.ACTIVE,
            uuid: v4(),
            createdAt: new Date(),
            createdBy: userContext.email,
            updatedAt: new Date(),
            updatedBy: userContext.email,
            permissions: membershipCreateRequest.permissions || [],
          },
          { upsert: true },
        );
      }
    } else {
      await this.membershipModel.updateOne(
        { tenantId: tenant.uuid, email },
        {
          status: MembershipStatus.INVITED,
          uuid: v4(),
          createdAt: new Date(),
          createdBy: userContext.email,
          updatedAt: new Date(),
          updatedBy: userContext.email,
          permissions: membershipCreateRequest.permissions || [],
        },
        { upsert: true },
      );
    }
  }

  public async list(entitiesPathParams: EntitiesPathParams, { active, direction, pageIndex, pageSize, filter }: ListParams): Promise<ListResponse<Membership>> {
    const items = await this.membershipModel
      .find({ ...(filter ? JSON.parse(filter) : {}), ...entitiesPathParams })
      .sort({ [active || '_id']: (direction || 'asc') as any })
      .skip((pageIndex || 0) * (pageSize || 10))
      .limit(pageSize || 10);
    const count = await this.membershipModel.countDocuments({
      ...(filter ? JSON.parse(filter) : {}),
      ...entitiesPathParams,
    });
    return { items: items as any, count };
  }

  public async update(userContext: UserContext, entityPathParams: EntityPathParams, body: MembershipUpdateRequest): Promise<void> {
    const membership = await this.membershipModel.findOne(entityPathParams).orFail(new HttpException('Membership not found', 404));

    membership.permissions = body.permissions || [];
    membership.changedAt = new Date();
    membership.changedBy = userContext.email;

    await membership.save();
  }

  public async delete(userContext: UserContext, entityPathParams: EntityPathParams): Promise<void> {
    const membership = await this.membershipModel.findOne(entityPathParams).orFail(new HttpException('Membership not found', 404));
    if (membership.userId === userContext.userId) {
      return;
    }

    await this.membershipModel.deleteOne(entityPathParams);
  }
}
