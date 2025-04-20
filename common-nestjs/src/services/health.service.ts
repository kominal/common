import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class HealthService {
	public async readHealth(): Promise<any> {
		return {
			services: [
				{
					name: 'Database',
					status: mongoose.connection.readyState === 0 ? 'ONLINE' : 'OFFLINE',
				},
			],
		};
	}
}
