import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from 'src/lote/entities/lote.entity';
import { Casa } from 'src/casa/entities/casa.entity';
import { Persona } from './entities/persona.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Casa,Persona,Ingreso])],
  controllers: [PersonaController],
  providers: [PersonaService],
})
export class PersonaModule {}
