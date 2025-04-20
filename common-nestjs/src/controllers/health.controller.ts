import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomOperationName } from '../helpers/custom-operation-name.decorator';
import { HealthService } from '../services/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
	public constructor(private healthService: HealthService) {}

	@Get()
	@CustomOperationName()
	public readHealth(): Promise<any> {
		return this.healthService.readHealth();
	}
}
