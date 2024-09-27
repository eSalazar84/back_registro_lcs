import { Module } from '@nestjs/common';
import { IngresoService } from './ingreso.service';
import { IngresoController } from './ingreso.controller';
import { Ingreso } from './entities/ingreso.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Casa } from 'src/casa/entities/casa.entity';
import { Lote } from 'src/lote/entities/lote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Casa,Persona,Ingreso])],
  controllers: [IngresoController],
  providers: [IngresoService],
})
export class IngresoModule {}
