import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from 'src/lote/entities/lote.entity';
import { Vivienda } from 'src/vivienda/entities/vivienda.entity';
import { Persona } from './entities/persona.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { LoteService } from 'src/lote/lote.service';
import { ViviendaService } from 'src/vivienda/vivienda.service';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Vivienda,Persona,Ingreso])],
  controllers: [PersonaController],
  providers: [PersonaService, LoteService, ViviendaService],
})
export class PersonaModule {}
