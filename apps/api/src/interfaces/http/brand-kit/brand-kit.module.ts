import { Module } from '@nestjs/common';
import { BrandKitController } from './brand-kit.controller';
import { BrandKitService } from '../../../app/brand-kit/brand-kit.service';

@Module({
  controllers: [BrandKitController],
  providers: [BrandKitService],
})
export class BrandKitModule {}
