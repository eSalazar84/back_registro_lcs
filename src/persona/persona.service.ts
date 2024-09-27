import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona) private readonly PersonaRepository: Repository<CreatePersonaDto>
  ) { }

  async create(createPersona: CreatePersonaDto): Promise<CreatePersonaDto> {
    const personaFound = await this.PersonaRepository.findOne({ where: { dni: createPersona.dni } })
    if (personaFound) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `NOT VALID`
      }, HttpStatus.BAD_REQUEST);
    }
    const newPersona = this.PersonaRepository.create(createPersona)
    const savePersona = await this.PersonaRepository.save(newPersona)

    return savePersona;
  }

  findAll() {
    return `This action returns all persona`;
  }

  findOne(id: number) {
    return `This action returns a #${id} persona`;
  }

  update(id: number, updatePersonaDto: UpdatePersonaDto) {
    return `This action updates a #${id} persona`;
  }

  remove(id: number) {
    return `This action removes a #${id} persona`;
  }
}
