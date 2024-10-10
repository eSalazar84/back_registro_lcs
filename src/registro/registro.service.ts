import { Injectable } from '@nestjs/common';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateViviendaDto } from 'src/casa/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { ViviendaService } from 'src/casa/vivienda.service';
import { LoteService } from 'src/lote/lote.service';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { PersonaService } from 'src/persona/persona.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Vivienda } from 'src/casa/entities/vivienda.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Repository } from 'typeorm';
import { Lote } from 'src/lote/entities/lote.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';


@Injectable()
export class RegistroService {
    constructor(
        @InjectRepository(Vivienda)
        private readonly viviendaRepository: Repository<CreateViviendaDto>,
        @InjectRepository(Persona)
        private readonly personaRepository: Repository<CreatePersonaDto>,
        @InjectRepository(Lote)
        private readonly loteRepository: Repository<CreateLoteDto>,
        @InjectRepository(Ingreso)
        private readonly ingresoRepository: Repository<CreateIngresoDto>
    ) { }
    async createRegistro(
        personaDto: CreatePersonaDto,
        viviendaDto: CreateViviendaDto,
        ingresoDto: CreateIngresoDto[],
        loteDto: CreateLoteDto
    ): Promise<any> {

        // Crear y guardar la vivienda
        const newVivienda = this.viviendaRepository.create(viviendaDto);
        await this.viviendaRepository.save(newVivienda);

        // Crear y guardar el lote
        const newLote = this.loteRepository.create(loteDto);
        await this.loteRepository.save(newLote);

        // Crear la persona con los IDs de las relaciones a lote y vivienda
        const newPersonaWithLote = this.personaRepository.create({
            ...personaDto,
            loteId: newLote.idLote, // Usar el ID del lote en lugar de la entidad
        });

        const newPersonaWithVivienda = this.personaRepository.create({
            ...newPersonaWithLote,
            viviendaId: newVivienda.idVivienda
        })

        await this.personaRepository.save(newPersonaWithVivienda);
        // Crear y guardar los ingresos, asignando la relación con Persona
        for (const ingreso of ingresoDto) {
            const newIngreso = this.ingresoRepository.create({
                ...ingreso,
                personaId: newPersonaWithVivienda.idPersona // Relación con Persona usando el ID
            });
            await this.ingresoRepository.save(newIngreso);
        }


        console.log(newPersonaWithVivienda);
        

        return { message: 'Registro creado exitosamente' };
    }
}