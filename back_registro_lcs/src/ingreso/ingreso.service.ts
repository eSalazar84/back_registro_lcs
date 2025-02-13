import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Persona } from 'src/persona/entities/persona.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class IngresoService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepository: Repository<Ingreso>, // Corregido a Repository<Ingreso>
    
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async createIngreso(ingresos: CreateIngresoDto[], idPersona: number): Promise<Ingreso[]> {
    const createdIngresos: Ingreso[] = [];

    // Iniciar una transacción para asegurar la atomicidad
    const queryRunner = this.ingresoRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const persona = await this.personaRepository.findOne({ where: { idPersona } });

      if (!persona) {
        throw new NotFoundException(`Persona con ID ${idPersona} no encontrada`);
      }

      for (const ingresoDto of ingresos) {
        const newIngreso = new Ingreso();
        newIngreso.idPersona = persona.idPersona;
        newIngreso.situacion_laboral = ingresoDto.situacion_laboral;
        newIngreso.ocupacion = ingresoDto.ocupacion;
        newIngreso.CUIT_empleador = ingresoDto.CUIT_empleador;
        newIngreso.salario = ingresoDto.salario;

        const savedIngreso = await queryRunner.manager.save(newIngreso);
        createdIngresos.push(savedIngreso);
      }

      await queryRunner.commitTransaction();
      return createdIngresos;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al crear ingresos: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllIngreso(): Promise<Ingreso[]> {
    return this.ingresoRepository.find();
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

  async updateIngreso(id: number, updateIngresoDto: UpdateIngresoDto): Promise<Ingreso> {
    const ingresoFound = await this.ingresoRepository.findOne({ where: { idIngreso: id } });

    if (!ingresoFound) {
      throw new NotFoundException(`Ingreso con id ${id} no encontrado`);
    }

    Object.assign(ingresoFound, updateIngresoDto);

    try {
      return await this.ingresoRepository.save(ingresoFound);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar ingreso: ' + error.message);
    }
  }

  async removeIngreso(id: number): Promise<void> {
    const ingreso = await this.ingresoRepository.findOne({ where: { idIngreso: id } });

    if (!ingreso) {
      throw new NotFoundException(`Ingreso con id ${id} no encontrado`);
    }

    await this.ingresoRepository.remove(ingreso);
  }
}
