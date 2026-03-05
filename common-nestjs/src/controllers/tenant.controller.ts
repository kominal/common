import { Body, Controller, Get, Inject, Optional, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Tenant, TenantCreateRequest, TenantUpdateRequest } from '../entities/tenant.entity';
import { TenantGuard } from '../guards/tenant.guard';
import { UserGuard } from '../guards/user.guard';
import { UserContext, UserCtx } from '../helpers/context.decorator';
import { CustomOperationName } from '../helpers/custom-operation-name.decorator';
import { KOMINAL_COMMON_TENANT_MODULE_OPTIONS, KominalCommonTenantModuleOptions } from '../kominal-common.module';
import { TenantService } from '../services/tenant.service';

@ApiTags('tenant-http')
@Controller('tenants')
export class TenantController {
  public constructor(
    private tenantService: TenantService,
    @Optional() @Inject(KOMINAL_COMMON_TENANT_MODULE_OPTIONS) private kominalCommonTenantModuleOptions?: KominalCommonTenantModuleOptions,
  ) {}

  @UseGuards(UserGuard)
  @Post()
  @CustomOperationName()
  @ApiCreatedResponse({ type: Tenant })
  public createForUser(@UserCtx() userContext: UserContext, @Body() body: TenantCreateRequest): Promise<Tenant> {
    if (this.kominalCommonTenantModuleOptions?.tenantCreation === 'ADMIN' && !userContext.admin) {
      throw new Error('Tenant creation is only allowed for admin users.');
    }

    return this.tenantService.createForUser(userContext, body);
  }

  @UseGuards(TenantGuard)
  @Get(':tenantId')
  @CustomOperationName()
  @ApiOkResponse({ type: Tenant })
  public read(@Param('tenantId') tenantId: string): Promise<Tenant> {
    return this.tenantService.read({ uuid: tenantId });
  }

  @UseGuards(UserGuard)
  @Get()
  @CustomOperationName()
  @ApiOkResponse({ type: Tenant, isArray: true })
  public list(@UserCtx() userContext: UserContext, @Query('select') select: string): Promise<Tenant[]> {
    return this.tenantService.listForUser(userContext, select);
  }

  @UseGuards(UserGuard)
  @Get()
  @CustomOperationName()
  @ApiOkResponse({ type: Tenant, isArray: true })
  public listForUser(@UserCtx() userContext: UserContext): Promise<Tenant[]> {
    return this.tenantService.listForUser(userContext);
  }

  @UseGuards(TenantGuard)
  @Put(':tenantId')
  @CustomOperationName()
  public updateForUser(@UserCtx() userContext: UserContext, @Param('tenantId') tenantId: string, @Body() body: TenantUpdateRequest): Promise<void> {
    return this.tenantService.updateForUser(userContext, tenantId, body);
  }
}
