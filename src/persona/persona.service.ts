import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona) private readonly personaRepository: Repository<CreatePersonaDto>
  ) { }

  // async create(createPersona: CreatePersonaDto): Promise<CreatePersonaDto> {

  //   const addPersona = this.personaRepository.create(createPersona)
  //   return await this.personaRepository.save(addPersona)
  // }
  async create(createPersona: CreatePersonaDto): Promise<CreatePersonaDto> {
    const personaFound = await this.personaRepository.findOne({ where: { dni: createPersona.dni } })
    if (personaFound) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `DNI ya registrado`
      }, HttpStatus.BAD_REQUEST);
    }
    const newPersona = this.personaRepository.create(createPersona)
    const savePersona = await this.personaRepository.save(newPersona)

    return savePersona
  }

  findAll() {
    return `This action returns all persona`;
  }

  findOne(id: number) {
    return `This action returns a #${id} persona`;
  }

  async updatePersona(id: number, updatePersonaDto: UpdatePersonaDto): Promise<UpdatePersonaDto> {
    try {
      const queryFound: FindOneOptions = { where: { idPersona: id } };
      const personaFound = await this.personaRepository.findOne(queryFound);

      if (!personaFound) {
        throw new NotFoundException(`Persona con id ${id} no encontrada`);
      }

      // Actualiza los campos de viviendaFound con los valores de updateViviendaDto
      Object.assign(personaFound, updatePersonaDto);

      // Guarda los cambios en la base de datos
      await this.personaRepository.save(personaFound);

      return personaFound;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la vivienda');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} persona`;
  }
}
