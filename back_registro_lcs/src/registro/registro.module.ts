import { LoteService } from '../lote/lote.service';
import { Module } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { RegistroController } from './registro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from '../lote/entities/lote.entity';
import { Vivienda } from '../vivienda/entities/vivienda.entity';
import { Persona } from '../persona/entities/persona.entity';
import { Ingreso } from '../ingreso/entities/ingreso.entity';
import { ViviendaService } from '../vivienda/vivienda.service';
import { PersonaService } from '../persona/persona.service';
import { IngresoService } from '../ingreso/ingreso.service';
import { MailserviceModule } from '../mailservice/mailservice.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Lote, Vivienda,Persona,Ingreso]), 
    MailserviceModule
  ],
  controllers: [RegistroController],
  providers: [RegistroService,LoteService, ViviendaService, PersonaService, IngresoService],
})
export class RegistroModule {}
