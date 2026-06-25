import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  storageKey: string;
  storageUrl: string;
}

@Injectable()
export class S3Adapter {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly logger = new Logger(S3Adapter.name);

  constructor() {
    this.endpoint = process.env['STORAGE_ENDPOINT'] ?? 'http://localhost:9000';
    this.bucket = process.env['STORAGE_BUCKET'] ?? 'slideforge-uploads';

    this.client = new S3Client({
      endpoint: this.endpoint,
      region: process.env['STORAGE_REGION'] ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env['STORAGE_ACCESS_KEY'] ?? 'minioadmin',
        secretAccessKey: process.env['STORAGE_SECRET_KEY'] ?? 'minioadmin',
      },
      forcePathStyle: process.env['STORAGE_FORCE_PATH_STYLE'] === 'true',
    });
  }

  async upload(key: string, body: Buffer, mimeType: string): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
    this.logger.log(`Uploaded ${key} (${body.length} bytes)`);
    return {
      storageKey: key,
      storageUrl: `${this.endpoint}/${this.bucket}/${key}`,
    };
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Deleted ${key}`);
  }
}
