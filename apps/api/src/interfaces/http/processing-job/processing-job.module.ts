import { Module } from '@nestjs/common';
import { ProcessingJobController } from './processing-job.controller';
import { ProcessingJobService } from '../../../app/processing-job/processing-job.service';

@Module({
  controllers: [ProcessingJobController],
  providers: [ProcessingJobService],
  exports: [ProcessingJobService],
})
export class ProcessingJobModule {}
