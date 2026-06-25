import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../infra/database/prisma.service';
import { S3Adapter } from '../../infra/storage/s3.adapter';
import { JobStatus, ProcessFileJobPayload } from '@slideforge/types';

@Injectable()
export class FileAssetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Adapter,
    @InjectQueue('processing') private readonly queue: Queue,
  ) {}

  async upload(
    workspaceId: string,
    uploadedBy: string,
    file: Express.Multer.File,
  ) {
    const storageKey = `${workspaceId}/${uuid()}-${file.originalname}`;
    const { storageUrl } = await this.s3.upload(storageKey, file.buffer, file.mimetype);

    const asset = await this.prisma.fileAsset.create({
      data: {
        workspaceId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
        storageUrl,
        uploadedByUserId: uploadedBy,
      },
    });

    const jobPayload: ProcessFileJobPayload = {
      jobId: '', // will be set after creation
      fileAssetId: asset.id,
      workspaceId,
      storageKey,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };

    const job = await this.prisma.processingJob.create({
      data: {
        workspaceId,
        type: 'file_parse',
        status: JobStatus.PENDING,
        payload: { fileAssetId: asset.id, storageKey, mimeType: file.mimetype, originalName: file.originalname },
      },
    });

    jobPayload.jobId = job.id;

    await this.queue.add('process-file', jobPayload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return { asset, jobId: job.id };
  }

  async list(workspaceId: string) {
    return this.prisma.fileAsset.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const asset = await this.prisma.fileAsset.findFirst({ where: { id, workspaceId } });
    if (!asset) throw new NotFoundException('File asset not found');
    return asset;
  }


  async getPresignedUrl(workspaceId: string, id: string) {
    const asset = await this.findOne(workspaceId, id);
    const url = await this.s3.getPresignedUrl(asset.storageKey);
    return { url, expiresIn: 3600 };
  }

  async delete(workspaceId: string, id: string) {
    const asset = await this.findOne(workspaceId, id);
    await this.s3.delete(asset.storageKey);
    await this.prisma.fileAsset.delete({ where: { id } });
  }
}
