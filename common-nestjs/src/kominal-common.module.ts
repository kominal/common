import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './controllers/file.controller';
import { HealthController } from './controllers/health.controller';
import { MembershipController } from './controllers/membership.controller';
import { TenantController } from './controllers/tenant.controller';
import { AccessToken, AccessTokenSchema } from './entities/access-token.entity';
import { Membership, MembershipSchema } from './entities/membership.entity';
import { Tenant, TenantSchema } from './entities/tenant.entity';
import { User, UserSchema } from './entities/user.entity';
import { AdminGuard } from './guards/admin.guard';
import { SystemGuard } from './guards/system.guard';
import { TenantGuard } from './guards/tenant.guard';
import { UserGuard } from './guards/user.guard';
import { AuthService } from './services/auth.service';
import { FileService } from './services/file.service';
import { HealthService } from './services/health.service';
import { MembershipService } from './services/membership.service';
import { TenantService } from './services/tenant.service';

export const KOMINAL_COMMON_MODULE_OPTIONS = 'KOMINAL_COMMON_MODULE_OPTIONS';

export const KOMINAL_COMMON_TENANT_MODULE_OPTIONS = 'KOMINAL_COMMON_TENANT_MODULE_OPTIONS';

export interface KominalCommonModuleOptions {
  tenantCreation: 'USER' | 'ADMIN';
}

export interface KominalCommonTenantModuleOptions extends KominalCommonModuleOptions {}

export class KominalCommonModule {
  public static forRoot(options: KominalCommonModuleOptions): DynamicModule {
    const mongooseModule = MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]);
    return {
      module: KominalCommonModule,
      imports: [mongooseModule],
      controllers: [HealthController],
      exports: [AuthService, HealthService, AdminGuard, UserGuard, SystemGuard, mongooseModule],
      providers: [AuthService, HealthService, AdminGuard, UserGuard, SystemGuard, { provide: KOMINAL_COMMON_MODULE_OPTIONS, useValue: options }],
    };
  }
}

export class KominalCommonTenantModule {
  public static forRoot(options: KominalCommonTenantModuleOptions): DynamicModule {
    const mongooseModule = MongooseModule.forFeature([
      { name: AccessToken.name, schema: AccessTokenSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]);
    const kominalCommonModule = KominalCommonModule.forRoot(options);
    return {
      module: KominalCommonTenantModule,
      imports: [kominalCommonModule, mongooseModule],
      controllers: [FileController, MembershipController, TenantController],
      providers: [FileService, MembershipService, TenantService, TenantGuard, { provide: KOMINAL_COMMON_TENANT_MODULE_OPTIONS, useValue: options }],
      exports: [kominalCommonModule, FileService, MembershipService, TenantService, TenantGuard, mongooseModule],
    };
  }
}
