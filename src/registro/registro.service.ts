import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Persona } from 'src/persona/entities/persona.entity';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateViviendaDto } from 'src/casa/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { PersonaService } from 'src/persona/persona.service';
import { ViviendaService } from 'src/casa/vivienda.service';
import { LoteService } from 'src/lote/lote.service';
import { IngresoService } from 'src/ingreso/ingreso.service';

@Injectable()
export class RegistroService {
  constructor(
    private personaService: PersonaService,
    private viviendaService: ViviendaService,
    private loteService: LoteService,
    private ingresoService: IngresoService
  ) {}

  async createAll(
    createPersonaDto: CreatePersonaDto,
    viviendaDto: CreateViviendaDto,
    ingresoDtos: CreateIngresoDto[],
    loteDto: CreateLoteDto,
  ): Promise<Persona> {
    try {
      console.log(
        'Inicio de createAll:',
        'personaIn', createPersonaDto,
        'viviendaIn', viviendaDto,
        'ingresoIn', ingresoDtos,
        'loteIn', loteDto
      );

      // Crear la vivienda primero
      const vivienda = await this.viviendaService.createVivienda(viviendaDto);
      console.log('Vivienda creada:', vivienda);

      // Crear el lote solo si la persona es titular
      let idLote: number | null = null;
      if (createPersonaDto.titular_cotitular === 'Titular') {
        const lote = await this.loteService.createLote(loteDto);
        console.log('Lote creado:', lote);
        idLote = lote.idLote; // Asignar el ID del lote solo si es titular
      } else {
        console.log('Persona es cotitular, no se crea lote.');
      }

      // Crear la persona pasando el ID de lote (o null si es cotitular)
      const persona = await this.personaService.createPersona(createPersonaDto, vivienda.idVivienda, idLote);
      console.log('Persona creada:', persona);

      // Crear y guardar los ingresos asociados a la persona
      const ingresos = await this.ingresoService.createIngreso(ingresoDtos, persona.idPersona);
      console.log('Ingresos creados.', ingresos);

      console.log('Fin de createAll. Persona retornada:', persona);
      return persona;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrio un error al crear la nueva dependencia`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
