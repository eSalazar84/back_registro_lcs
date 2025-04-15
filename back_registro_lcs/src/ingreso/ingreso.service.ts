import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { FindOneOptions, Repository } from 'typeorm';

import { Persona } from 'src/persona/entities/persona.entity';
import { EntityManager } from 'typeorm';
import { Registro } from 'src/registro/entities/registro.entity';


@Injectable()
export class IngresoService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepository: Repository<Ingreso>, // Corregido a Repository<Ingreso>


    @InjectRepository(Registro)
    private readonly registroRepository: Repository<Registro>, // Corregido a Repository<Ingreso>



    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) { }


  async createIngreso(
    ingresos: CreateIngresoDto | CreateIngresoDto[], // Acepta tanto array como objeto individual
    idPersona: number,
    idRegistro: number,
    manager?: EntityManager
  ): Promise<Ingreso[]> {
    const ingresoRepo = manager ? manager.getRepository(Ingreso) : this.ingresoRepository;
    const personaRepo = manager ? manager.getRepository(Persona) : this.personaRepository;
    const registroRepo = manager ? manager.getRepository(Registro) : this.registroRepository;
  
    // Convertir a array si es un objeto individual
    const ingresosArray = Array.isArray(ingresos) ? ingresos : [ingresos];
    
    const createdIngresos: Ingreso[] = [];
  
    try {
      const persona = await personaRepo.findOne({ where: { idPersona } });
      const registro = await registroRepo.findOne({ where: { idRegistro } });
  
      if (!persona || !registro) {
        throw new NotFoundException(`Persona o Registro no encontrados`);
      }
  
      for (const dto of ingresosArray) {
        const nuevo = ingresoRepo.create({
          situacion_laboral: dto.situacion_laboral,
          ocupacion: dto.ocupacion,
          CUIT_empleador: dto.CUIT_empleador,
          salario: dto.salario,
          persona,
          registro,
        });
  
        createdIngresos.push(await ingresoRepo.save(nuevo));
      }
  
      return createdIngresos;
  
    } catch (error) {
      console.error("❌ Error al crear ingresos:", error);
      throw new InternalServerErrorException('Error al crear ingresos: ' + error.message);

 
    }
  }

  async findAllIngreso(): Promise<Ingreso[]> {
    return this.ingresoRepository.find();
  }

  async findByPersona(idPersona: number): Promise<Ingreso[]> {
    return await this.ingresoRepository.find({
      where: { persona: { idPersona } },
    });
  }
  


  async findOneById(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepository.findOne({
      where: { idIngreso: id },
      relations: ['persona'],
    });

    if (!ingreso) {
      throw new NotFoundException(`No se encontró el ingreso con ID ${id}`);
    }

    return ingreso;
  }


  async updateIngreso(
    idIngreso: number,
    updateDto: UpdateIngresoDto,
    manager?: EntityManager
  ): Promise<Ingreso> {
    const ingresoRepo = manager ? manager.getRepository(Ingreso) : this.ingresoRepository;

    const ingreso = await ingresoRepo.findOne({ where: { idIngreso } });
    if (!ingreso) {
      throw new NotFoundException(`Ingreso con ID ${idIngreso} no encontrado`);
    }

    ingresoRepo.merge(ingreso, updateDto);

    try {
      return await ingresoRepo.save(ingreso);
    } catch (error) {
      console.error("❌ Error al actualizar ingreso:", error);
      throw new InternalServerErrorException("Error al actualizar ingreso: " + error.message);
    }
  }

  async removeIngreso(idIngreso: number): Promise<void> {
    const ingreso = await this.ingresoRepository.findOneBy({ idIngreso });
    if (!ingreso) return;
  
    await this.ingresoRepository.remove(ingreso);
  }
  


  // Metodo para buscar los ingresos de las personas por id (se usa en PdfService)

  async getIngresosByPersonaId(idPersona: number): Promise<Ingreso[]> {
    const persona = await this.personaRepository.findOne({ where: { idPersona }, relations: ['ingresos'] });
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${idPersona} no encontrada`);
    }
    return persona.ingresos;
  }
}
