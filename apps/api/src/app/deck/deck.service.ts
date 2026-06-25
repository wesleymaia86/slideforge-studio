import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export interface CreateDeckDto {
  name: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface CreateSlideDto {
  position: number;
  title?: string;
  layoutType?: string;
  contentJson?: object;
  notesText?: string;
}

@Injectable()
export class DeckService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateDeckDto) {
    return this.prisma.deck.create({ data: { projectId, ...dto } });
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
    return this.prisma.deck.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.deck.delete({ where: { id } });
  }

  // Slides

  async addSlide(deckId: string, dto: CreateSlideDto) {
    await this.findOne(deckId);
    return this.prisma.slide.create({ data: { deckId, ...dto } });
  }

  async listSlides(deckId: string) {
    return this.prisma.slide.findMany({
      where: { deckId },
      orderBy: { position: 'asc' },
    });
  }

  async updateSlide(slideId: string, dto: Partial<CreateSlideDto>) {
    return this.prisma.slide.update({ where: { id: slideId }, data: dto });
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
