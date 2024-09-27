import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCasaDto } from './dto/create-casa.dto';
import { UpdateCasaDto } from './dto/update-casa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Casa } from './entities/casa.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { PersonaService } from 'src/persona/persona.service';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { LoteService } from 'src/lote/lote.service';

@Injectable()
export class CasaService {
  constructor(
    @InjectRepository(Casa) private readonly casaRepository: Repository<CreateCasaDto>
  ) { }

  async createCasa(createCasa: CreateCasaDto): Promise<CreateCasaDto> {
    const addCasa = this.casaRepository.create(createCasa)
    return await this.casaRepository.save(addCasa)
  }

  async findAllCasa():Promise<CreateCasaDto[]> {
    const allCasa= await this.casaRepository.find()
    return  allCasa;
  }

  findOne(id: number) {
    return `This action returns a #${id} casa`;
  }

  async updateCasa(id: number, updateCasaDto: UpdateCasaDto): Promise<UpdateCasaDto> {
    try {
      const queryFound: FindOneOptions = { where: { idCasa: id } };
      const casaFound = await this.casaRepository.findOne(queryFound);
  
      if (!casaFound) {
        throw new NotFoundException(`Casa con id ${id} no encontrada`);
      }
  
      // Aquí podrías actualizar la entidad con updateCasaDto si es necesario
      return casaFound;
    } catch (error) {
      // Aquí puedes manejar errores específicos si es necesario
      throw new InternalServerErrorException('Error al actualizar la casa');
    }
  }
  
}
