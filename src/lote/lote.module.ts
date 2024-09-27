import { Module } from '@nestjs/common';
import { LoteService } from './lote.service';
import { LoteController } from './lote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { Casa } from 'src/casa/entities/casa.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Casa,Persona,Ingreso])],
  controllers: [LoteController],
  providers: [LoteService],
})
export class LoteModule {}
