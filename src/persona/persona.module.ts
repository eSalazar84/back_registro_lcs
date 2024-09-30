import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from 'src/lote/entities/lote.entity';
import { Vivienda } from 'src/casa/entities/vivienda.entity';
import { Persona } from './entities/persona.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Vivienda,Persona,Ingreso])],
  controllers: [PersonaController],
  providers: [PersonaService],
})
export class PersonaModule {}
