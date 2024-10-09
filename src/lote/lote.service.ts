import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class LoteService {
  constructor(
    @InjectRepository(Lote) private readonly loteRepository: Repository<CreateLoteDto>
  ) { }

  async createLote(createLote: CreateLoteDto): Promise<CreateLoteDto> {
    const loteSelect = this.loteRepository.create(createLote)
    return await this.loteRepository.save(loteSelect);
  }

  findAll() {
    return `This action returns all lote`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lote`;
  }

  async updateLote(id: number, updateLoteDto: UpdateLoteDto) : Promise<CreateLoteDto>{
  try{
    const queryFound: FindOneOptions= {where:{idLote: id}}
    const loteFound= await this.loteRepository.findOne(queryFound)
   
    if(!loteFound){
      throw new NotFoundException(`Lotecon id ${id} no encontrado`)
    }
    Object.assign(loteFound, updateLoteDto);

    await this.loteRepository.save(loteFound);

    return loteFound;
  }catch(error){
    throw new InternalServerErrorException('error al cambiar ubicaacion de lote')
  }
   
  }

  remove(id: number) {
    return `This action removes a #${id} lote`;
  }
}
