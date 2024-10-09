import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Persona } from 'src/persona/entities/persona.entity';
import { Vivienda } from 'src/casa/entities/vivienda.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { Lote } from 'src/lote/entities/lote.entity';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateViviendaDto } from 'src/casa/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateLoteDto } from 'src/lote/dto/update-lote.dto';

@Injectable()
export class RegistroService {
    constructor(
        @InjectRepository(Persona)
        private personaRepository: Repository<Persona>,
        @InjectRepository(Vivienda)
        private viviendaRepository: Repository<Vivienda>,
        @InjectRepository(Ingreso)
        private ingresoRepository: Repository<Ingreso>, // Cambiado a entidad Ingreso
        @InjectRepository(Lote)
        private loteRepository: Repository<Lote>,
    ) {}

    async createAll(
        createPersonaDto: CreatePersonaDto,
        viviendaDto: CreateViviendaDto,
        ingresoDtos: CreateIngresoDto[] | CreateIngresoDto,
        loteDto: CreateLoteDto | UpdateLoteDto,
    ): Promise<Persona> {
        console.log("Inicio de createAll:", "personaIn", createPersonaDto, "viviendaIn", viviendaDto, "ingresoIn", ingresoDtos, "loteIn", loteDto);
    
        // Crear y guardar la Vivienda
        const vivienda = this.viviendaRepository.create(viviendaDto);
        const savedVivienda = await this.viviendaRepository.save(vivienda);
    
        // Crear y guardar el Lote
        const lote = this.loteRepository.create(loteDto);
        const savedLote = await this.loteRepository.save(lote);
    
        // Crear la Persona
        const personaDto: CreatePersonaDto = {
            ...createPersonaDto,
            idVivienda: savedVivienda.idVivienda,
            idLote: savedLote.idLote,
        };
    
        console.log("que tiene personaDto", personaDto);
    
        const persona = this.personaRepository.create(personaDto);
        const savedPersona = await this.personaRepository.save(persona);
    
           // Crear los Ingresos
  const ingresosArray = Array.isArray(ingresoDtos) ? ingresoDtos : [ingresoDtos];

  for (const ingresoDto of ingresosArray) {
    const ingreso: CreateIngresoDto = {
      ...ingresoDto,
      idPersona: savedPersona.idPersona, // Asegúrate de asignar el ID
     
    };

    const newIngreso = this.ingresoRepository.create(ingreso); // Crear ingreso
    await this.ingresoRepository.save(newIngreso); // Guardar ingreso
  }
    
        console.log("Fin de createAll. Persona retornada:", savedPersona);
        return savedPersona;
    }
}
