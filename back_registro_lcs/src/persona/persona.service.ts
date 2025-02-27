import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { FindOneOptions, In, Repository } from 'typeorm';
import { Titular_Cotitular } from './enum/titular_cotitular.enum';
import { ViviendaService } from 'src/vivienda/vivienda.service';


@Injectable()
export class PersonaService {


  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    private readonly viviendaService: ViviendaService,

  ) { }

  async createPersona(createPersonaDto: CreatePersonaDto, idVivienda: number, idLote: number): Promise<Persona> {
    console.log("personaS", idLote);
  
    // Verificar si el DNI ya existe
    const personaFound = await this.personaRepository.findOne({ where: { dni: createPersonaDto.dni } });
    if (personaFound) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `DNI ya registrado`
      }, HttpStatus.BAD_REQUEST);
    }
  
    let personaData = {
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
      personaData.numero_registro = (lastPersona?.numero_registro ?? 0) + 1;
      personaData.vinculo = createPersonaDto.vinculo ?? null;
    } else {
      personaData.numero_registro = null;
    }
  
    // 🔹 Limpiar espacios antes y después de cada string en personaData
    personaData = this.trimStrings(personaData);
  
    // Crear instancia de Persona
    const persona = this.personaRepository.create(personaData);
  
    // Guardar en la base de datos
    return await this.personaRepository.save(persona);
  }
  
  /**
   * 🔥 Función que recorre un objeto y aplica `.trim()` a todas sus propiedades tipo `string`
   */
  private trimStrings<T>(obj: T): T {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      acc[key] = typeof value === "string" ? value.trim() : value;
      return acc;
    }, {} as T);
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
    // Buscar la persona por su ID
    const persona = await this.personaRepository.findOne({ where: { idPersona: id } });
  
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
  
    // Asegúrate de que hay valores a actualizar (no esté vacío)
    if (Object.keys(updatePersonaDto).length === 0) {
      throw new Error('No hay valores para actualizar');
    }
  
    // 🔹 Limpiar espacios antes y después de cada string en updatePersonaDto
    const trimmedDto = this.trimStrings(updatePersonaDto);
  
    // Actualizar los campos de la persona con los valores del DTO
    Object.assign(persona, trimmedDto);
  
    // Guardar la persona actualizada
    return await this.personaRepository.save(persona);
  }

  async remove(id: number): Promise<void> {
    // Buscar la persona por su ID
    const persona = await this.personaRepository.findOne({
      where: { idPersona: id },
      relations: ['vivienda'], // Cargar la vivienda asociada
    });

    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    const vivienda = persona.vivienda; // Vivienda asociada a la persona (si existe)

    // Eliminar la persona de la base de datos
    await this.personaRepository.remove(persona);

    if (vivienda) {
      // Verificar si quedan más personas asociadas a esta vivienda
      const personasRestantes = await this.personaRepository.count({
        where: { vivienda: { idVivienda: vivienda.idVivienda } },
      });

      // Si no quedan personas, eliminar la vivienda y si quedan personas no elimina la vivienda
      if (personasRestantes === 0) {
        await this.viviendaService.removeVivienda(vivienda.idVivienda);
      }
    }
  }

  async findByViviendaId(idVivienda: number) {
    try {
      const personas = await this.personaRepository.find({
        where: {
          vivienda: { idVivienda: idVivienda }
        },
        relations: [
          'vivienda',
          'ingresos',
          'lote'
        ],
        order: {
          apellido: 'ASC',
          nombre: 'ASC'
        }
      });
  
      if (!personas || personas.length === 0) {
        throw new NotFoundException(`No se encontraron personas para la vivienda con ID ${idVivienda}`);
      }
  
      return personas;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error al buscar personas por vivienda',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
