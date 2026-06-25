import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from '../../../app/deck/deck.service';

@Module({
  controllers: [DeckController],
  providers: [DeckService],
  exports: [DeckService],
})
export class DeckModule {}
