import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { StoredFile, StoredFileSignedUrl } from '../models/stored-file.model';

@Injectable()
export class FileService {
	private s3Client = new S3Client({
		endpoint: process.env.S3_ENDPOINT,
		forcePathStyle: true,
		region: 'eu',
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY || '',
			secretAccessKey: process.env.S3_SECRET_KEY || '',
		},
	});

	private bucket = process.env.S3_BUCKET || '';

	public async storeFile(tenantId: string, buffer: Buffer, originalname: string, userId: string, email: string): Promise<StoredFile> {
		const fileName = `${v4()}_${v4()}_${originalname}`;
		const key = `tenants/${tenantId}/${fileName}`;
		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: buffer,
				ACL: 'private',
				Metadata: {
					tenantId,
					userId,
					email,
					originalname,
				},
			})
		);

		return { name: originalname, location: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`, key };
	}

	public async getSignedUrl(tenantId: string, key: string): Promise<StoredFileSignedUrl> {
		const head = await this.s3Client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));

		if (head.Metadata?.tenantid !== tenantId) {
			throw new Error('Unauthorized');
		}

		const url = await getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 3600 });

		return { url };
	}
}
