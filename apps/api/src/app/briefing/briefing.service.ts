import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { AiClient } from '@slideforge/ai';
import type { BriefingInput } from '@slideforge/types';

@Injectable()
export class BriefingService {
  private readonly ai: AiClient;

  constructor(private readonly prisma: PrismaService) {
    this.ai = new AiClient();
  }

  async createBriefing(deckId: string, input: BriefingInput) {
    return this.prisma.briefing.create({
      data: {
        deckId,
        audience: input.audience,
        objective: input.objective,
        toneVoice: input.toneVoice,
        contextJson: input.context as object,
      },
    });
  }

  async getBriefingForDeck(deckId: string) {
    return this.prisma.briefing.findMany({
      where: { deckId },
      include: { outlines: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateOutline(briefingId: string, dataContext?: string) {
    const briefing = await this.prisma.briefing.findUnique({ where: { id: briefingId } });
    if (!briefing) throw new NotFoundException('Briefing not found');

    const input: BriefingInput = {
      audience: briefing.audience ?? undefined,
      objective: briefing.objective ?? undefined,
      toneVoice: briefing.toneVoice ?? undefined,
      context: briefing.contextJson as Record<string, unknown>,
    };

    const outline = await this.ai.generateOutline(input, dataContext);

    return this.prisma.outline.create({
      data: {
        briefingId,
        slidesJson: outline as object,
      },
    });
  }

  async getOutlines(briefingId: string) {
    return this.prisma.outline.findMany({
      where: { briefingId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
