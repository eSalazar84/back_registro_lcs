import { Module } from '@nestjs/common';
import { LoteService } from './lote.service';
import { LoteController } from './lote.controller';

@Module({
  controllers: [LoteController],
  providers: [LoteService],
})
export class LoteModule {}
