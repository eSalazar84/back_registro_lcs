import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Persona } from 'src/persona/entities/persona.entity';

@Injectable()
export class IngresoService {
  constructor(
    @InjectRepository(Ingreso) 
    private readonly ingresoRepository: Repository<CreateIngresoDto>,
    
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) { }

  async createIngreso(ingresos: CreateIngresoDto[], idPersona: number): Promise<Ingreso[]> {
    const createdIngresos: Ingreso[] = []; // Array para almacenar los ingresos creados

    for (const ingresoDto of ingresos) {
        const persona = await this.personaRepository.findOne({ where: { idPersona: idPersona } });
        console.log("persona para ingreso", persona);
        
        if (!persona) {
            throw new Error(`Persona with ID ${ingresoDto.idPersona} not found`);
        }

        // Crear una nueva instancia de la entidad Ingreso
        const newIngreso = new Ingreso();
        newIngreso.idPersona = persona.idPersona; // Asignar el id de persona encontrado
        newIngreso.situacion_laboral = ingresoDto.situacion_laboral;
        newIngreso.ocupacion = ingresoDto.ocupacion;
        newIngreso.CUIT_empleador = ingresoDto.CUIT_empleador;
        newIngreso.salario = ingresoDto.salario;

        // Guardar el nuevo ingreso en la base de datos
        const savedIngreso = await this.ingresoRepository.save(newIngreso);
        createdIngresos.push(savedIngreso); // Agregar el ingreso guardado al array
    }

    return createdIngresos; // Devolver todas las entidades Ingreso creadas
}


  findAll() {
    return `This action returns all ingreso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingreso`;
  }

  async updateIngreso(id: number, updateIngresoDto: UpdateIngresoDto): Promise<Ingreso[]> {
    
    try {
        const queryFound: FindOneOptions = { where: { idIngreso: id } };
        const ingresoFound = await this.ingresoRepository.findOne(queryFound);

        if (!ingresoFound) {
            throw new NotFoundException(`Ingreso con id ${id} no encontrada`);
        }

        // Actualizar los campos del ingreso encontrado
        Object.assign(ingresoFound, updateIngresoDto);

        // Guardar los cambios en la base de datos

        const newIngreso = new Ingreso();
        newIngreso.idPersona = ingresoFound.idPersona; // Asignar el id de persona encontrado
        newIngreso.situacion_laboral = ingresoFound.situacion_laboral;
        newIngreso.ocupacion = ingresoFound.ocupacion;
        newIngreso.CUIT_empleador = ingresoFound.CUIT_empleador;
        newIngreso.salario = ingresoFound.salario;
        await this.ingresoRepository.save(newIngreso);
        const createdIngresos: Ingreso[] = []; 
        createdIngresos.push(newIngreso)

        return createdIngresos // Devolver el ingreso actualizado
    } catch (error) {
        throw new InternalServerErrorException('Error al actualizar ingreso: ' + error.message);
    }
}


  remove(id: number) {
    return `This action removes a #${id} ingreso`;
  }
}
