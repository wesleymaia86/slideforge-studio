import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export interface CreateDeckDto {
  name: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface CreateSlideDto {
  position: number;
  layout?: string;
  content?: object;
  speakerNotes?: string;
}

@Injectable()
export class DeckService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, workspaceId: string, createdByUserId: string, dto: CreateDeckDto) {
    return this.prisma.deck.create({
      data: {
        projectId,
        workspaceId,
        createdByUserId,
        title: dto.name,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
      },
    });
  }

  async list(projectId: string) {
    return this.prisma.deck.findMany({
      where: { projectId },
      include: { _count: { select: { slides: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: { slides: { orderBy: { position: 'asc' } } },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return deck;
  }

  async update(id: string, dto: Partial<CreateDeckDto>) {
    await this.findOne(id);
    return this.prisma.deck.update({
      where: { id },
      data: {
        title: dto.name,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.deck.delete({ where: { id } });
  }

  // Slides

  async addSlide(deckId: string, dto: CreateSlideDto) {
    await this.findOne(deckId);
    return this.prisma.slide.create({
      data: {
        deckId,
        position: dto.position,
        layout: (dto.layout ?? 'content') as Parameters<typeof this.prisma.slide.create>[0]['data']['layout'],
        content: dto.content ?? {},
        speakerNotes: dto.speakerNotes,
      },
    });
  }

  async listSlides(deckId: string) {
    return this.prisma.slide.findMany({
      where: { deckId },
      orderBy: { position: 'asc' },
    });
  }

  async updateSlide(slideId: string, dto: Partial<CreateSlideDto>) {
    return this.prisma.slide.update({
      where: { id: slideId },
      data: {
        position: dto.position,
        layout: dto.layout as Parameters<typeof this.prisma.slide.update>[0]['data']['layout'],
        content: dto.content,
        speakerNotes: dto.speakerNotes,
      },
    });
  }

  async deleteSlide(slideId: string) {
    await this.prisma.slide.delete({ where: { id: slideId } });
  }

  async reorderSlides(deckId: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.slide.update({ where: { id }, data: { position: index + 1 } }),
    );
    return this.prisma.$transaction(updates);
  }
}
