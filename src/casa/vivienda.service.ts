import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateViviendaDto } from './dto/create-vivienda.dto';
import { UpdateViviendaDto } from './dto/update-vivienda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vivienda } from './entities/vivienda.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { PersonaService } from 'src/persona/persona.service';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { LoteService } from 'src/lote/lote.service';

@Injectable()
export class ViviendaService {
  constructor(
    @InjectRepository(Vivienda) private readonly viviendaRepository: Repository<CreateViviendaDto>
  ) { }

  async createVivienda(createVivienda: CreateViviendaDto): Promise<CreateViviendaDto> {
    const addVivienda = this.viviendaRepository.create(createVivienda)
    return await this.viviendaRepository.save(addVivienda)
  }

  async findAllVivienda(): Promise<CreateViviendaDto[]> {
    const allVivienda = await this.viviendaRepository.find()
    return allVivienda;
  }

  findOne(id: number) {
    return `This action returns a #${id} vivienda`;
  }

  async updateVivienda(id: number, updateViviendaDto: UpdateViviendaDto): Promise<UpdateViviendaDto> {
    try {
      const queryFound: FindOneOptions = { where: { idVivienda: id } };
      const viviendaFound = await this.viviendaRepository.findOne(queryFound);

      if (!viviendaFound) {
        throw new NotFoundException(`Vivienda con id ${id} no encontrada`);
      }

      // Actualiza los campos de viviendaFound con los valores de updateViviendaDto
      Object.assign(viviendaFound, updateViviendaDto);

      // Guarda los cambios en la base de datos
      await this.viviendaRepository.save(viviendaFound);

      return viviendaFound;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la vivienda');
    }
  }

}
