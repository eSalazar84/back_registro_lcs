import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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


 async findAllIngreso(): Promise<Ingreso[]> {
    const allIngreso = await this.ingresoRepository.find()
    return allIngreso;
  }



  async findOneById(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepository.findOne({
      where: { idIngreso: id },
      relations: ['persona'], // Incluimos la relación con persona
    });

    if (!ingreso) {
      throw new NotFoundException(`No se encontró el ingreso con ID ${id}`);
    }

    return ingreso;
  }
  

  async updateIngreso(id: number, updateIngresoDto: UpdateIngresoDto): Promise<Ingreso> {
    try {
      // Buscar el ingreso por ID
      const ingresoFound = await this.ingresoRepository.findOne({ where: { idIngreso: id } });
  
      if (!ingresoFound) {
        throw new NotFoundException(`Ingreso con id ${id} no encontrado`);
      }
  
      // Actualizar los campos del ingreso encontrado con los valores del DTO
      Object.assign(ingresoFound, updateIngresoDto);
  
      // Guardar los cambios en la base de datos
      const updatedIngreso = await this.ingresoRepository.save(ingresoFound);
  
      // Devolver el ingreso actualizado
      return updatedIngreso;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar ingreso: ' + error.message);
    }
  }
  


  async removeIngreso(id: number): Promise<void> {
  
    const ingreso = await this.ingresoRepository.findOne({ where: { idIngreso: id } });
  
    if (!ingreso) {
      throw new Error('ingreso no encontrada');
    }
  
    // Eliminar ingreso de la base de datos
    await this.ingresoRepository.remove(ingreso);
  }
  
}
