import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { StoredFile } from '../models/stored-file.model';

export async function storeFile(tenantId: string, buffer: Buffer, originalname: string, fileName: string, userId: string, email: string): Promise<StoredFile> {
  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    region: 'eu',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
  });

  const params: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET || '',
    Key: `uploads/${tenantId}/${fileName}`,
    Body: buffer,
    ACL: 'public-read',
    Metadata: {
      tenantId,
      userId,
      email,
      originalname,
    },
  };

  await s3Client.send(new PutObjectCommand(params));

  return { name: originalname, location: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${params.Key}`, key: params.Key || '' };
}
