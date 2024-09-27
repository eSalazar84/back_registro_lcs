import { LoteService } from 'src/lote/lote.service';
import { Module } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { RegistroController } from './registro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from 'src/lote/entities/lote.entity';
import { Casa } from 'src/casa/entities/casa.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { CasaService } from 'src/casa/casa.service';
import { PersonaService } from 'src/persona/persona.service';
import { IngresoService } from 'src/ingreso/ingreso.service';


@Module({
  imports:[TypeOrmModule.forFeature([Lote,Casa,Persona,Ingreso]), ],
  controllers: [RegistroController],
  providers: [RegistroService,LoteService, CasaService, PersonaService, IngresoService],
})
export class RegistroModule {}
