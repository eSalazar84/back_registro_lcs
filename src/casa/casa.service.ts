import { Injectable } from '@nestjs/common';
import { CreateCasaDto } from './dto/create-casa.dto';
import { UpdateCasaDto } from './dto/update-casa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Casa } from './entities/casa.entity';
import { Repository } from 'typeorm';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { Lote } from 'src/lote/entities/lote.entity';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { Persona } from 'src/persona/entities/persona.entity';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { PersonaService } from 'src/persona/persona.service';

@Injectable()
export class CasaService {
  constructor(
    @InjectRepository(Casa) private readonly casaRepository: Repository<CreateCasaDto>,
    @InjectRepository(Ingreso) private readonly ingresoRepository: Repository<CreateIngresoDto>,
    @InjectRepository(Lote) private readonly loteRepository: Repository<CreateLoteDto>,
    @InjectRepository(Persona) private readonly personaRepository: Repository<CreatePersonaDto>,
    private readonly personaService: PersonaService
  ) { }

  async create(
    createCasa: CreateCasaDto,
    createIngreso: CreateIngresoDto,
    createLote: CreateLoteDto,
    createPersona: CreatePersonaDto
  ): Promise<any> {
    await this.personaService.create(createPersona)
  }

  findAll() {
    return `This action returns all casa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} casa`;
  }

  update(id: number, updateCasaDto: UpdateCasaDto) {
    return `This action updates a #${id} casa`;
  }

  remove(id: number) {
    return `This action removes a #${id} casa`;
  }
}
