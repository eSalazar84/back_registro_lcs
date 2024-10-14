import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { FindOneOptions, In, Repository } from 'typeorm';
import { Titular_Cotitular } from './enum/titular_cotitular.enum';


@Injectable()
export class PersonaService {

  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,

  ) { }

  async createPersona(createPersonaDto: CreatePersonaDto, idVivienda: number, idLote: number): Promise<Persona> {
    // Inicializar el objeto persona con el DTO y los IDs de vivienda y lote
    console.log("personaS", idLote);

    const personaFound = await this.personaRepository.findOne({ where: { dni: createPersonaDto.dni } })
    if (personaFound) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `DNI ya registrado`
      }, HttpStatus.BAD_REQUEST);
    } else {
      const personaData = {
        ...createPersonaDto,
        idVivienda,
      };

      // Asignar el número de registro si es titular
      if (createPersonaDto.titular_cotitular === Titular_Cotitular.Titular) {
        // Buscar el último número de registro entre los titulares
        const lastPersona = await this.personaRepository.findOne({
          order: { numero_registro: 'DESC' },
          where: { titular_cotitular: Titular_Cotitular.Titular },
        });
        // Si existe una persona, incrementa el número, sino empieza desde 0
        personaData.numero_registro = (lastPersona?.numero_registro ?? -1) + 1;
      } else {
        // Si es cotitular, asignar null al número de registro
        personaData.numero_registro = null;
      }
      // Crear una instancia de la entidad Persona
      const persona = this.personaRepository.create(personaData);   

      // Guardar la persona en la base de datos
      return await this.personaRepository.save(persona);
    }
  }

  findAll() {
    return `This action returns all persona`;
  }

  async findOne(id: number): Promise<Persona> {
    const query: FindOneOptions<Persona> = { where: { idPersona: id }, relations: ['lote'] };

    const persona = await this.personaRepository.findOne(query);
    if (!persona) {
      throw new HttpException('Lote no encontrado', HttpStatus.NOT_FOUND);
    }
    return persona;
  }
  async updatePersona(id: number, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { idPersona: id } });

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Asegúrate de que hay valores a actualizar
    if (Object.keys(updatePersonaDto).length === 0) {
      throw new Error('No hay valores para actualizar');
    }
    // Guarda la persona actualizada
    return await this.personaRepository.save(persona);
  }

  remove(id: number) {
    return `This action removes a #${id} persona`;
  }
}
