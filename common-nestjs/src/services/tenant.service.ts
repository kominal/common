import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Membership, MembershipModel, MembershipStatus } from '../entities/membership.entity';
import { Tenant, TenantCreateRequest, TenantModel, TenantUpdateRequest } from '../entities/tenant.entity';
import { UserContext } from '../helpers/context.decorator';
import { created, EntityService, GlobalEntityPathParams } from '../helpers/entity-service.helper';
import { TECHNICAL_KEYS_BASE_ENTITY } from '../models/entity.model';

@Injectable()
export class TenantService extends EntityService<Tenant, {}, GlobalEntityPathParams> {
  public constructor(
    @InjectModel(Tenant.name) private tenantModel: TenantModel,
    @InjectModel(Membership.name) private membershipModel: MembershipModel,
  ) {
    super(tenantModel, { technicalKeys: TECHNICAL_KEYS_BASE_ENTITY });
  }

  public async createForUser(userContext: UserContext, request: TenantCreateRequest): Promise<Tenant> {
    const { name } = request;

    const tenant = await this.create(userContext, {}, { name });

    await this.membershipModel.create(
      created<Membership>(userContext, {
        tenantId: tenant.uuid,
        userId: userContext.userId,
        email: userContext.email,
        status: MembershipStatus.ACTIVE,
      }),
    );

    return tenant;
  }

  public async listForUser(userContext: UserContext, select?: string): Promise<Tenant[]> {
    if (userContext.admin) {
      return this.tenantModel
        .find()
        .select(select || '')
        .exec();
    }

    const memberships = await this.membershipModel.find({ userId: userContext.userId });
    return this.tenantModel.find({ uuid: { $in: memberships.map((membership) => membership.tenantId) } });
  }

  public async updateForUser(userContext: UserContext, tenantId: string, body: TenantUpdateRequest): Promise<void> {
    const tenant = await this.tenantModel.findOne({ uuid: tenantId }).orFail(new HttpException('Tenant not found', 404));

    tenant.name = body.name;
    tenant.logo = body.logo;
    tenant.changedAt = new Date();
    tenant.changedBy = userContext.email;

    await tenant.save();
  }
}
