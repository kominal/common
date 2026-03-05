import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Membership, MembershipCreateRequest, MembershipUpdateRequest } from '../entities/membership.entity';
import { TenantGuard } from '../guards/tenant.guard';
import { UserContext, UserCtx } from '../helpers/context.decorator';
import { CustomOperationName } from '../helpers/custom-operation-name.decorator';
import { EntitiesPathParams, EntityPathParams, ListParams, ListResponse, OpenApiPaginationResponse } from '../helpers/entity-service.helper';
import { MembershipService } from '../services/membership.service';

@UseGuards(TenantGuard)
@ApiTags('membership-http')
@Controller('tenants/:tenantId/memberships')
export class MembershipController {
  public constructor(private service: MembershipService) {}

  @Post()
  @CustomOperationName()
  public create(@UserCtx() userContext: UserContext, @Param() entitiesPathParams: EntitiesPathParams, @Body() createRequest: MembershipCreateRequest): Promise<void> {
    return this.service.create(userContext, entitiesPathParams, createRequest);
  }

  @Get()
  @CustomOperationName()
  @OpenApiPaginationResponse(Membership)
  public list(@Param() entitiesPathParams: EntitiesPathParams, @Query() listParams: ListParams): Promise<ListResponse<Membership>> {
    return this.service.list(entitiesPathParams, listParams);
  }

  @UseGuards(TenantGuard)
  @Put(':uuid')
  @CustomOperationName()
  public update(@UserCtx() userContext: UserContext, @Param() entityPathParams: EntityPathParams, @Body() body: MembershipUpdateRequest): Promise<void> {
    return this.service.update(userContext, entityPathParams, body);
  }

  @Delete(':uuid')
  @CustomOperationName()
  public delete(@UserCtx() userContext: UserContext, @Param() entityPathParams: EntityPathParams): Promise<void> {
    return this.service.delete(userContext, entityPathParams);
  }
}
