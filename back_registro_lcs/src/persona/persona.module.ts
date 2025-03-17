import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from '../lote/entities/lote.entity';
import { Vivienda } from '../vivienda/entities/vivienda.entity';
import { Persona } from './entities/persona.entity';
import { Ingreso } from '../ingreso/entities/ingreso.entity';
import { LoteService } from '../lote/lote.service';
import { ViviendaService } from '../vivienda/vivienda.service';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Vivienda,Persona,Ingreso])],
  controllers: [PersonaController],
  providers: [PersonaService, LoteService, ViviendaService],
})
export class PersonaModule {}
