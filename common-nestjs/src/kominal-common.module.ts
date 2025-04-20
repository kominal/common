import { Module, ModuleMetadata } from "@nestjs/common";
import { ModelDefinition, MongooseModule } from "@nestjs/mongoose";
import { HealthController } from "./controllers/health.controller";
import { AccessToken, AccessTokenSchema } from "./entities/access-token.entity";
import { Membership, MembershipSchema } from "./entities/membership.entity";
import { Tenant, TenantSchema } from "./entities/tenant.entity";
import { User, UserSchema } from "./entities/user.entity";
import { AdminGuard } from "./guards/admin.guard";
import { SystemGuard } from "./guards/system.guard";
import { TenantGuard } from "./guards/tenant.guard";
import { UserGuard } from "./guards/user.guard";
import { AuthService } from "./services/auth.service";
import { FileService } from "./services/file.service";
import { HealthService } from "./services/health.service";

export const kominalCommonModelDefinitions: ModelDefinition[] = [
  { name: AccessToken.name, schema: AccessTokenSchema },
  { name: Membership.name, schema: MembershipSchema },
  { name: Tenant.name, schema: TenantSchema },
  { name: User.name, schema: UserSchema },
]


export const kominalCommonModuleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature(kominalCommonModelDefinitions)
  ],
  controllers: [HealthController],
  providers: [AuthService, FileService, HealthService, AdminGuard, TenantGuard, UserGuard, SystemGuard],
  exports: [AuthService, FileService, HealthService, AdminGuard, TenantGuard, UserGuard, SystemGuard],
}

@Module(kominalCommonModuleMetadata)
export class KominalCommonModule {}
