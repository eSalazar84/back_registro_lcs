import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class IngresoService {
  constructor(
    @InjectRepository(Ingreso) private readonly ingresoRepository: Repository<CreateIngresoDto>
  ) { }

  async createIngreso(createIngreso: CreateIngresoDto): Promise<CreateIngresoDto> {
    const addIngreso = this.ingresoRepository.create(createIngreso)
    return await this.ingresoRepository.save(addIngreso)
  }

  findAll() {
    return `This action returns all ingreso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingreso`;
  }

  async updateIngreso(id: number, updateIngresoDto: UpdateIngresoDto):Promise<UpdateIngresoDto> {
   try{
    const queryFound: FindOneOptions= {where:{ idIngreso: id}};
    const ingresoFound= await this.ingresoRepository.findOne(queryFound);
    if(!ingresoFound){
      throw new NotFoundException(`Ingreso con id ${id} no encontrada`)
    }
    Object.assign(ingresoFound, updateIngresoDto);
    await this.ingresoRepository.save(ingresoFound)

    return ingresoFound;
   }catch (error){
    throw new InternalServerErrorException('Error al actualizar ingreso')

   }
  }

  remove(id: number) {
    return `This action removes a #${id} ingreso`;
  }
}
