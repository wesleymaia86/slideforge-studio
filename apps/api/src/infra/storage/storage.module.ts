import { Global, Module } from '@nestjs/common';
import { S3Adapter } from './s3.adapter';

@Global()
@Module({
  providers: [S3Adapter],
  exports: [S3Adapter],
})
export class StorageModule {}
