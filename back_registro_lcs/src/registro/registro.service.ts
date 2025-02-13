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
import { MailserviceService } from 'src/mailservice/mailservice.service';
import { Vivienda } from 'src/vivienda/entities/vivienda.entity';
import { DataSource } from 'typeorm';



@Injectable()
export class RegistroService {
    constructor(
        private readonly personaService: PersonaService,
        private readonly viviendaService: ViviendaService,
        private readonly loteService: LoteService,
        private readonly ingresoService: IngresoService,
        private readonly mailserviceService: MailserviceService,
        private readonly dataSource: DataSource
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

        const viviendasCreadas: { [key: string]: Vivienda } = {};
        const viviendasVerificadas: { [key: string]: boolean } = {};
    
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            console.log("🔹 Iniciando createAll. Cantidad de personas recibidas:", personas.length);
    
            // Verificación previa de datos sin crear entidades
            for (const personaData of personas) {
                const { persona, vivienda } = personaData;
                const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;
    
                if (!viviendasVerificadas[viviendaKey]) {
                    const viviendaFound = await queryRunner.manager.findOne(Vivienda, {
                        where: {
                            direccion: vivienda.direccion,
                            numero_direccion: vivienda.numero_direccion,
                            localidad: vivienda.localidad,
                            departamento: vivienda.departamento,
                            piso_departamento: vivienda.piso_departamento,
                            numero_departamento: vivienda.numero_departamento
                        }
                    });
                    if (viviendaFound) {

       
                        throw new HttpException(
                            `El departamento en la dirección ${vivienda.direccion} ${vivienda.numero_direccion}, piso ${vivienda.piso_departamento}, número ${vivienda.numero_departamento} ya está registrado.`,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    viviendasVerificadas[viviendaKey] = true;
                }
    

                const personaFound = await queryRunner.manager.findOne(Persona, {
                    where: { dni: persona.dni }
                });
                if (personaFound) {
                    throw new HttpException(`La persona con DNI ${persona.dni} ya está registrada.`, HttpStatus.BAD_REQUEST);
                }

    
                const edad = this.calcularEdad(persona.fecha_nacimiento);
                if (persona.titular_cotitular === 'Titular' && edad < 18) {
                    throw new HttpException(`La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`, HttpStatus.BAD_REQUEST);
                }
            }
    
            console.log("✅ Verificación completada. Procediendo a crear registros...");
    
            // Creación de entidades dentro de la transacción
            for (const personaData of personas) {
                const { persona, vivienda, ingresos, lote } = personaData;
                const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;
    

                let viviendaReutilizada = viviendasCreadas[viviendaKey];
                if (!viviendaReutilizada) {
                    viviendaReutilizada = await this.viviendaService.createVivienda(vivienda);
                    viviendasCreadas[viviendaKey] = viviendaReutilizada;
                }
    
                let idLote: number | null = null;
                if (persona.titular_cotitular === 'Titular' && lote) {
                    const loteCreado = await this.loteService.createLote(lote);
                    idLote = loteCreado.idLote;
                }
    
                const personaCreada = await this.personaService.createPersona(persona, viviendaReutilizada.idVivienda, idLote);
                createdPersonas.push(personaCreada);
    
                if (ingresos && ingresos.length > 0) {
                    await this.ingresoService.createIngreso(ingresos, personaCreada.idPersona);
                }
            }
    
            await queryRunner.commitTransaction();

            // Obtener los datos completos de las personas creadas (con relaciones)
            const personasCompletas = await Promise.all(
                createdPersonas.map(async (persona) => {
                    return await this.personaService.findOneById(persona.idPersona);
                })
            );

            const titularEmail = personas[0].persona.email;

            const nombreTitular = `${createdPersonas[0].nombre} ${createdPersonas[0].apellido}`;

            // Obtener el número de registro de la persona creada
            const numeroRegistro = createdPersonas[0].numero_registro;

            console.log('listado de personas creadas:', createdPersonas);

            // Enviar correo con PDF adjunto y número de registro
            await this.mailserviceService.sendRegisterEmail(
                titularEmail,
                nombreTitular,
                numeroRegistro,
                personasCompletas
            );
            return createdPersonas;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(`Error al crear las dependencias: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
        }
    }
  }
