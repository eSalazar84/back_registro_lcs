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

@Injectable()
export class RegistroService {
    constructor(
      
        private readonly personaService: PersonaService,
        private readonly viviendaService: ViviendaService,
        private readonly loteService: LoteService,
        private readonly ingresoService: IngresoService,       
    ) {}

    // Función para calcular la edad a partir de la fecha de nacimiento
    private calcularEdad(fechaNacimiento: Date): number {
        const hoy = new Date();
        const fechaNac = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--; // Ajustar si no ha pasado el cumpleaños este año
        }
        return edad;
    }

    async createAll(
        personas: {
            persona: CreatePersonaDto,
            vivienda: CreateViviendaDto,
            ingresos?: CreateIngresoDto[],
            lote?: CreateLoteDto
        }[]
    ): Promise<Persona[]> {
        const createdPersonas: Persona[] = [];
        const viviendasCreadas: { [key: string]: any } = {}; // Objeto para almacenar viviendas por clave
        const viviendasVerificadas: { [key: string]: boolean } = {}; // Objeto para almacenar viviendas verificadas

        // Verificación de si la vivienda ya existe, antes del try
        if (personas.length > 0) {
            for (const personaData of personas) {
                const { vivienda } = personaData;

                // Crear una clave única para identificar la vivienda
                const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}-${vivienda.departamento}-${vivienda.piso_departamento}-${vivienda.numero_departamento}`;

                // Si ya se verificó esta vivienda en el proceso, continuar con la siguiente
                if (viviendasVerificadas[viviendaKey]) {
                    continue;
                }

                console.log("que tiene viviendaKey", viviendaKey);

                console.log("que tiene viviendasVerificadas", viviendasVerificadas);
                
                

                // Buscar la vivienda en la base de datos
                const viviendaFound = await this.viviendaService.findByAddress(
                    vivienda.direccion,
                    vivienda.numero_direccion,
                    vivienda.localidad,
                    vivienda.departamento,
                    vivienda.piso_departamento,
                    vivienda.numero_departamento
                  
                );
                console.log("que tiene viviendaFounf", viviendaFound);
                

                if (viviendaFound && viviendaFound.departamento === false) {
                    // Si se encuentra una vivienda registrada, lanzamos una excepción
                    console.error(`La vivienda en ${vivienda.direccion}, ${vivienda.numero_direccion}, ${vivienda.localidad} ya está registrada.`);
                    throw new HttpException({
                        status: HttpStatus.BAD_REQUEST,
                        error: `La vivienda en ${vivienda.direccion}, ${vivienda.numero_direccion}, ${vivienda.localidad} ya está registrada.`,
                    }, HttpStatus.BAD_REQUEST);
                }
                if (viviendaFound && viviendaFound.piso_departamento === vivienda.piso_departamento && viviendaFound.numero_departamento === vivienda.numero_departamento ){
                      // Si se encuentra una vivienda registrada, lanzamos una excepción
                      console.error(`El departamento en ${vivienda.direccion}, ${vivienda.numero_direccion}, ${vivienda.piso_departamento}, ${vivienda.numero_departamento} ${vivienda.localidad} ya está registrada.`);
                      throw new HttpException({
                          status: HttpStatus.BAD_REQUEST,
                          error: `El departamento en ${vivienda.direccion}, ${vivienda.numero_direccion}, ${vivienda.piso_departamento}, ${vivienda.numero_departamento} ${vivienda.localidad} ya está registrada.`,
                      }, HttpStatus.BAD_REQUEST);
                }

                // Marcar esta vivienda como verificada (no está registrada en la base de datos)
                viviendasVerificadas[viviendaKey] = true;
            }

            // Verificar si alguna de las personas ya está registrada
            for (const personaData of personas) {
                const { persona } = personaData;

                const personaFound = await this.personaService.findOneByDni(persona.dni);
                if (personaFound) {
                    console.log(`La persona con DNI ${persona.dni} ya está registrada.`);
                    throw new HttpException({
                        status: HttpStatus.BAD_REQUEST,
                        error: `La persona con DNI ${persona.dni} ya está registrada.`,
                    }, HttpStatus.BAD_REQUEST);
                }
            }

            // Si no se encuentra la vivienda y ninguna persona está registrada, continuar con la creación
            try {
                for (const personaData of personas) {
                    const { persona, vivienda, ingresos, lote } = personaData;

                                 // Crear una clave única para la vivienda
                    const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;

                    // Verificar si la vivienda ya fue creada previamente en este proceso
                    if (!viviendasCreadas[viviendaKey]) {
                        // Si la vivienda no fue encontrada previamente, crearla
                        const viviendaCreada = await this.viviendaService.createVivienda(vivienda);
                        console.log('Vivienda creada:', viviendaCreada);
                        viviendasCreadas[viviendaKey] = viviendaCreada; // Almacenar la vivienda creada
                    } //else {
                    //     console.log('Vivienda ya existe en la base de datos o fue creada previamente.');
                    // }

                    const viviendaReutilizada = viviendasCreadas[viviendaKey]; // Obtener la vivienda reutilizada

                    // Crear el lote solo si la persona es titular
                    let idLote: number | null = null;
                    if (persona.titular_cotitular === 'Titular') {
                        const loteFound = await this.loteService.createLote(lote);
                    
                        idLote = loteFound.idLote; // Asignar el ID del lote solo si es titular
                        
                    } 

                    // Crear la persona y asignar la vivienda existente
                    const personaCreada = await this.personaService.createPersona(persona, viviendaReutilizada.idVivienda, idLote);
                   
                    // Crear los ingresos solo si la persona es mayor de edad (18 años o más) y se han proporcionado ingresos
                    const edad = this.calcularEdad(persona.fecha_nacimiento);
                    if (edad >= 18 && ingresos && ingresos.length > 0) {
                        const ingresosCreados = await this.ingresoService.createIngreso(ingresos, personaCreada.idPersona);
                       
                    } 

                    // Añadir la persona creada al array de resultados
                    createdPersonas.push(personaCreada);
                }

                console.log('Fin de createAll. Personas retornadas:', createdPersonas);
                return createdPersonas;

            } catch (error) {
                console.error("Error detectado en el flujo de createAll:", error);
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `Ocurrió un error al crear las nuevas dependencias`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

 
}
