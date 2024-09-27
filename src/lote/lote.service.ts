import { Injectable } from '@nestjs/common';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LoteService {
  constructor(
    @InjectRepository(Lote) private readonly loteRepository: Repository<CreateLoteDto>
  ) { }

  async create(createLote: CreateLoteDto): Promise<CreateLoteDto> {
    const loteChosen = this.loteRepository.create(createLote)
    return await this.loteRepository.save(loteChosen);
  }

  findAll() {
    return `This action returns all lote`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lote`;
  }

  update(id: number, updateLoteDto: UpdateLoteDto) {
    return `This action updates a #${id} lote`;
  }

  remove(id: number) {
    return `This action removes a #${id} lote`;
  }
}
