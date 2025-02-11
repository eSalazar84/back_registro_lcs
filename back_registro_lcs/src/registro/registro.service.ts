import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository, DataSource, FindOneOptions } from 'typeorm';

import { Persona } from 'src/persona/entities/persona.entity';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateViviendaDto } from 'src/vivienda/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { PersonaService } from 'src/persona/persona.service';
import { ViviendaService } from 'src/vivienda/vivienda.service';
import { LoteService } from 'src/lote/lote.service';
import { IngresoService } from 'src/ingreso/ingreso.service';
import { MailserviceService } from 'src/mailservice/mailservice.service';



@Injectable()
export class RegistroService {
    constructor(

        private readonly personaService: PersonaService,
        private readonly viviendaService: ViviendaService,
        private readonly loteService: LoteService,
        private readonly ingresoService: IngresoService,
        private readonly mailserviceService: MailserviceService

    ) { }

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
                if (viviendaFound && viviendaFound.piso_departamento === vivienda.piso_departamento && viviendaFound.numero_departamento === vivienda.numero_departamento) {
                    // Si se encuentra una vivienda registrada, lanzamos una excepción
                    console.error(`El departamento en ${vivienda.direccion}, ${vivienda.numero_direccion}, ${vivienda.piso_departamento}, ${vivienda.numero_departamento} ${vivienda.localidad} ya está registrada.`);
                    throw new HttpException({
                        status: HttpStatus.BAD_REQUEST,
                        error: `El departamento en ${vivienda.direccion}, ${vivienda.numero_direccion}, ${vivienda.piso_departamento}, ${vivienda.numero_departamento} ${vivienda.localidad} ya está registrada.`,
                    }, HttpStatus.BAD_REQUEST);

                }
    
                console.log("🔹 Verificando si las personas ya están registradas...");
    
                for (const personaData of personas) {
                    const { persona } = personaData;
    
                    console.log(`🔍 Buscando persona con DNI ${persona.dni} en la base de datos...`);
                    const personaFound = await queryRunner.manager.findOne(Persona, {
                        where: { dni: persona.dni }
                    });
    
                    if (personaFound) {
                        console.error(`❌ ERROR: La persona con DNI ${persona.dni} ya está registrada.`);
                        throw new HttpException(`La persona con DNI ${persona.dni} ya está registrada.`, HttpStatus.BAD_REQUEST);
                    }
    
                    // ✅ Validación: No permitir que una persona menor de edad sea titular
                    const edad = this.calcularEdad(persona.fecha_nacimiento);
                    if (persona.titular_cotitular === 'Titular' && edad < 18) {
                        console.error(`❌ ERROR: La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`);
                        throw new HttpException(
                            `La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                }
    
                console.log("✅ Verificación completada. Procediendo a crear registros...");
    
                for (const personaData of personas) {
                    const { persona, vivienda, ingresos, lote } = personaData;

                    if (persona.titular_cotitular === 'Titular') {
                        const edad = this.calcularEdad(persona.fecha_nacimiento);
                        if (edad < 18) {
                            throw new HttpException({
                                status: 400,
                                error: `La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`,
                            },
                                400);
                        }
                    }


                    // Crear una clave única para la vivienda

                    const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;
    
                    console.log(`🔹 Procesando persona: ${persona.nombre} (DNI: ${persona.dni})`);
    
                    if (!viviendasCreadas[viviendaKey]) {
                        console.log(`🏠 Creando vivienda: ${viviendaKey}`);
                        const viviendaCreada = await queryRunner.manager.save(Vivienda, vivienda);
                        viviendasCreadas[viviendaKey] = viviendaCreada;
                        console.log("✅ Vivienda creada:", viviendaCreada);
                    } else {
                        console.log(`✅ Vivienda ${viviendaKey} ya creada en este proceso.`);
                    }
    
                    const viviendaReutilizada = viviendasCreadas[viviendaKey];
    
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

                const titularEmail = personas[0].persona.email;

                const nombreTitular = `${createdPersonas[0].nombre} ${createdPersonas[0].apellido}`;
                console.log('Nombre del titular:', nombreTitular);

                // Obtener el número de registro de la persona creada
                const numeroRegistro = createdPersonas[0].numero_registro;

                // Enviar correo con PDF adjunto y número de registro
                await this.mailserviceService.sendRegisterEmail(
                    titularEmail,
                    nombreTitular,
                    numeroRegistro, // Pasar el número de registro al servicio de correo
                    createdPersonas.map(personaData => {
                        return {
                            nombre: personaData.nombre,
                            apellido: personaData.apellido,
                            dni: personaData.dni,
                            fecha_nacimiento: personaData.fecha_nacimiento,
                            vinculo: personaData.vinculo,
                            numero_registro: personaData.numero_registro,
                            CUIL_CUIT: personaData.CUIL_CUIT
                        };
                    })
                );

                console.log('Fin de createAll. Personas retornadas:', createdPersonas);
                return createdPersonas;

            } catch (error) {
                console.error('🔥 Error en createAll:', error);

                throw new HttpException(
                    {
                        status: error.status || 400,
                        error: error.response?.error || error.message || 'Ocurrió un error en el servidor',
                    },
                    error.status || HttpStatus.BAD_REQUEST
                );
            }

        }
    }
}
