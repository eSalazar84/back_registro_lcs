import { Injectable } from '@nestjs/common';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { LoteService } from 'src/lote/lote.service';
import { PersonaService } from 'src/persona/persona.service';
import { ViviendaService } from 'src/casa/vivienda.service';
import { CreateViviendaDto } from 'src/casa/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';

@Injectable()
export class RegistroService {
  constructor(
    private readonly ingresoService: IngresoService,
    private readonly loteService: LoteService,
    private readonly personaService: PersonaService,
    private readonly viviendaService: ViviendaService
  ) { }

  async create(lote: CreateLoteDto, vivienda: CreateViviendaDto, ingreso: CreateIngresoDto, persona: CreatePersonaDto,): Promise<any> {

    return 'This action adds a new registro';
  }

  findAll() {
    return `This action returns all registro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registro`;
  }

  update(id: number, updateRegistroDto: UpdateRegistroDto) {
    return `This action updates a #${id} registro`;
  }

  remove(id: number) {
    return `This action removes a #${id} registro`;
  }
}
