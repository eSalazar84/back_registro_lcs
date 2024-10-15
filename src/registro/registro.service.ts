import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Persona } from 'src/persona/entities/persona.entity';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateViviendaDto } from 'src/vivienda/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { PersonaService } from 'src/persona/persona.service';
import { ViviendaService } from 'src/vivienda/vivienda.service';
import { LoteService } from 'src/lote/lote.service';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RegistroService {
    constructor(
        @InjectRepository(Persona)
        private readonly personaRepository: Repository<Persona>,
        private personaService: PersonaService,
        private viviendaService: ViviendaService,
        private loteService: LoteService,
        private ingresoService: IngresoService
    ) { }

    async createAll(
        createPersonaDto: CreatePersonaDto,
        viviendaDto: CreateViviendaDto,
        ingresoDtos: CreateIngresoDto[],
        loteDto: CreateLoteDto,
    ): Promise<Persona> {
        try {
            console.log(
                'Inicio de createAll:',
                'Persona', createPersonaDto,
                'Vivienda', viviendaDto,
                'Ingresos', ingresoDtos,
                'Lote', loteDto
            );

            // Verificar si ya existe una persona con el mismo DNI
            console.log("Buscando persona con DNI:", createPersonaDto.dni);
            const personaFound = await this.personaService.findOneByDni(createPersonaDto.dni);
            console.log("Resultado de persona encontrada por DNI:", personaFound);

            // Si la persona es encontrada, lanzar excepción. Si no, continuar.
            if (personaFound) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `La persona con DNI ${createPersonaDto.dni} ya está registrada.`,
                }, HttpStatus.BAD_REQUEST);
            }

            // Continuar con la creación de la vivienda y la persona
            console.log('No se encontró persona con el DNI, se procede con la creación.');

            // Crear la vivienda primero
            const vivienda = await this.viviendaService.createVivienda(viviendaDto);
            console.log('Vivienda creada:', vivienda);

            // Crear el lote solo si la persona es titular
            let idLote: number | null = null;
            if (createPersonaDto.titular_cotitular === 'Titular') {
                const lote = await this.loteService.createLote(loteDto);
               
                console.log('Lote creado:', lote);
                idLote = lote.idLote; // Asignar el ID del lote solo si es titular
                console.log("id lote", idLote);
                
            } else {
                console.log('Persona es cotitular, no se crea lote.');
            }

            // Crear la persona pasando el ID de lote (o null si es cotitular)
            const persona = await this.personaService.createPersona(createPersonaDto, vivienda.idVivienda, idLote);
            console.log("id lote en persona", idLote);
            
            console.log('Persona creada:', persona);

            // Crear y guardar los ingresos asociados a la persona
            const ingresos = await this.ingresoService.createIngreso(ingresoDtos, persona.idPersona);
            console.log('Ingresos creados.', ingresos);

            console.log('Fin de createAll. Persona retornada:', persona);
            return persona;

        } catch (error) {
            console.error("Error detectado en el flujo de createAll:", error); // Log extendido de error

            if (error instanceof HttpException) {
                throw error;  // Lanza el error tal cual si ya es una HttpException
            }

            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Ocurrió un error al crear la nueva dependencia`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
