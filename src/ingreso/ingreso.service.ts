import { Injectable } from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IngresoService {
  constructor(
    @InjectRepository(Ingreso) private readonly ingresoRepository: Repository<CreateIngresoDto>
  ) { }

  async create(createIngreso: CreateIngresoDto): Promise<CreateIngresoDto> {
    const addIngreso = this.ingresoRepository.create(createIngreso)
    return await this.ingresoRepository.save(addIngreso)
  }

  findAll() {
    return `This action returns all ingreso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingreso`;
  }

  update(id: number, updateIngresoDto: UpdateIngresoDto) {
    return `This action updates a #${id} ingreso`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingreso`;
  }
}
