import { Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { v4 } from 'uuid';
import { TenantGuard } from '../guards/tenant.guard';
import { UserContext, UserCtx } from '../helpers/context.decorator';
import { CustomOperationName } from '../helpers/custom-operation-name.decorator';
import { storeFile } from '../helpers/s3.helper';
import { StoredFile } from '../models/stored-file.model';

@UseGuards(TenantGuard)
@ApiTags('file-http')
@Controller('tenants/:tenantId/files')
export class FileController {
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @CustomOperationName()
  @ApiCreatedResponse({ type: StoredFile })
  public async uploadFile(@UserCtx() userContext: UserContext, @UploadedFile() file: any, @Param('tenantId') tenantId: string): Promise<StoredFile> {
    return storeFile(tenantId, file.buffer, file.originalname, `${v4()}_${v4()}_${file.originalname}`, userContext.userId, userContext.email);
  }
}
