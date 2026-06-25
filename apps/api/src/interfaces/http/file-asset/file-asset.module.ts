import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { FileAssetController } from './file-asset.controller';
import { FileAssetService } from '../../../app/file-asset/file-asset.service';
import { StorageModule } from '../../../infra/storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'processing' }),
    StorageModule,
  ],
  controllers: [FileAssetController],
  providers: [FileAssetService],
  exports: [FileAssetService],
})
export class FileAssetModule {}
