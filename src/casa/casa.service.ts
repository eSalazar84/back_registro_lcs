import { Injectable } from '@nestjs/common';
import { CreateCasaDto } from './dto/create-casa.dto';
import { UpdateCasaDto } from './dto/update-casa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Casa } from './entities/casa.entity';
import { Repository } from 'typeorm';
import { PersonaService } from 'src/persona/persona.service';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { LoteService } from 'src/lote/lote.service';

@Injectable()
export class CasaService {
  constructor(
    @InjectRepository(Casa) private readonly casaRepository: Repository<CreateCasaDto>
  ) { }

  async create(createCasa: CreateCasaDto): Promise<CreateCasaDto> {
    const addCasa = this.casaRepository.create(createCasa)
    return await this.casaRepository.save(addCasa)
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
