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
  private readonly publicUrl: string;
  private readonly logger = new Logger(S3Adapter.name);

  constructor() {
    this.client = new S3Client({
      endpoint: process.env['S3_ENDPOINT'] ?? 'http://localhost:9000',
      region: process.env['S3_REGION'] ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env['S3_ACCESS_KEY'] ?? 'minioadmin',
        secretAccessKey: process.env['S3_SECRET_KEY'] ?? 'minioadmin',
      },
      forcePathStyle: true,
    });
    this.bucket = process.env['S3_BUCKET'] ?? 'slideforge-assets';
    this.publicUrl = process.env['S3_PUBLIC_URL'] ?? `http://localhost:9000/${this.bucket}`;
  }

  async upload(
    key: string,
    body: Buffer,
    mimeType: string,
  ): Promise<UploadResult> {
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
      storageUrl: `${this.publicUrl}/${key}`,
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
