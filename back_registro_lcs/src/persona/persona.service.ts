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
        idLote,
      };

      // Asignar el número de registro si es titular
      if (createPersonaDto.titular_cotitular === Titular_Cotitular.Titular) {
        // Buscar el último número de registro entre los titulares
        const lastPersona = await this.personaRepository.findOne({
          order: { numero_registro: 'DESC' },
          where: { titular_cotitular: Titular_Cotitular.Titular },
        });
        // Si existe una persona, incrementa el número, sino empieza desde 0
        personaData.numero_registro = (lastPersona?.numero_registro ?? 0 ) + 1;
        personaData.vinculo = createPersonaDto.vinculo ?? null;

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

  async findAll(): Promise<Persona[]> {
    try {
      // Encuentra todas las personas con las relaciones necesarias
      const personas = await this.personaRepository.find({
        relations: ['vivienda', 'lote', 'ingresos'], // Incluye las relaciones con 'vivienda', 'lote' e 'ingresos'
        order: { idPersona: 'ASC' }, // Ordena por ID de persona
      });
  
      if (!personas || personas.length === 0) {
        throw new NotFoundException('No se encontraron personas registradas.');
      }
  
      // Mapear los resultados para incluir el total de salario de los ingresos
      return personas.map(persona => ({
        ...persona,
        totalSalario: persona.ingresos
          ? persona.ingresos.reduce((acc, ingreso) => acc + (ingreso.salario || 0), 0) // Calcula el total salario (si existe)
          : 0, // Si no tiene ingresos, el total es 0
      }));
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener personas: ${error.message}`);
    }
  }
  
  
  async findOneById(id: number): Promise<Persona & { totalSalario: number }> {
    try {
      // Buscar la persona por id con las relaciones necesarias
      const persona = await this.personaRepository.findOne({
        where: { idPersona: id },
        relations: ['vivienda', 'lote', 'ingresos'], // Relacionar con vivienda, lote e ingresos
      });
  
      if (!persona) {
        throw new HttpException('Persona no encontrada', HttpStatus.NOT_FOUND);
      }
  
      // Calcular el total de salario
      const totalSalario = persona.ingresos
        ? persona.ingresos.reduce((acc, ingreso) => acc + (ingreso.salario || 0), 0)
        : 0;
  
      // Retornar el objeto persona con el totalSalario agregado
      return {
        ...persona,
        totalSalario, // Agregar el totalSalario al objeto persona
      };
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener la persona: ${error.message}`);
    }
  }
  
  async findOneByDniRegistro(dni: number): Promise<Persona | null> {
    const persona = await this.personaRepository.findOne({ where: { dni } });

    // Retornar null si no se encuentra la persona en vez de lanzar excepción
    if (!persona) {
      return null;
    }
    return persona;
  }

  async findOneByDni(dni: number): Promise<Persona & { totalSalario: number }> {
    try {
      // Buscar la persona por id con las relaciones necesarias
      const persona = await this.personaRepository.findOne({
        where: { dni: dni },
        relations: ['vivienda', 'lote', 'ingresos'], // Relacionar con vivienda, lote e ingresos
      });
  
      if (!persona) {
        throw new HttpException('Persona no encontrada', HttpStatus.NOT_FOUND);
      }
  
      // Calcular el total de salario
      const totalSalario = persona.ingresos
        ? persona.ingresos.reduce((acc, ingreso) => acc + (ingreso.salario || 0), 0)
        : 0;
  
      // Retornar el objeto persona con el totalSalario agregado
      return {
        ...persona,
        totalSalario, // Agregar el totalSalario al objeto persona
      };
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener la persona: ${error.message}`);
    }
  }
  

  async updatePersona(id: number, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    // Buscar la persona por su DNI
    const persona = await this.personaRepository.findOne({ where: { idPersona: id } });
  
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
  
    // Asegúrate de que hay valores a actualizar (no esté vacío)
    if (Object.keys(updatePersonaDto).length === 0) {
      throw new Error('No hay valores para actualizar');
    }
  
    // Actualizar los campos de la persona con los valores del DTO
    Object.assign(persona, updatePersonaDto);  // Actualiza la persona con el DTO
  
    // Guardar la persona actualizada
    return await this.personaRepository.save(persona);
  }
  

  async remove(id: number): Promise<void> {
    // Buscar la persona por su DNI
    const persona = await this.personaRepository.findOne({ where: { idPersona: id } });
  
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
  
    // Eliminar la persona de la base de datos
    await this.personaRepository.remove(persona);
  }
  
}
