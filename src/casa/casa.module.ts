import { Module } from '@nestjs/common';
import { CasaService } from './casa.service';
import { CasaController } from './casa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from 'src/lote/entities/lote.entity';
import { Casa } from './entities/casa.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Lote,Casa,Persona,Ingreso])],
  controllers: [CasaController],
  providers: [CasaService],
})
export class CasaModule {}
