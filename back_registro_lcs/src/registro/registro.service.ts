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
import { Vivienda } from 'src/vivienda/entities/vivienda.entity';
import { Lote } from 'src/lote/entities/lote.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';

@Injectable()
export class RegistroService {
    constructor(

        private readonly personaService: PersonaService,
        private readonly viviendaService: ViviendaService,
        private readonly loteService: LoteService,
        private readonly ingresoService: IngresoService,
        private readonly dataSource: DataSource,

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
        const viviendasCreadas: { [key: string]: any } = {};
        const viviendasVerificadas: { [key: string]: boolean } = {};
    
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            console.log("🔹 Iniciando createAll. Cantidad de personas recibidas:", personas.length);
    
            if (personas.length > 0) {
                console.log("🔹 Verificando si las viviendas ya existen...");
    
                for (const personaData of personas) {
                    const { vivienda } = personaData;
                    const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;
    
                    if (viviendasVerificadas[viviendaKey]) {
                        console.log(`✅ Vivienda ${viviendaKey} ya verificada, omitiendo...`);
                        continue;
                    }
    
                    console.log(`🔍 Buscando vivienda en la base de datos: ${viviendaKey}`);
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
                        console.error(`❌ ERROR: La vivienda ${viviendaKey} ya está registrada.`);
                        throw new HttpException(`La vivienda en ${vivienda.direccion}, ${vivienda.localidad} ya está registrada.`, HttpStatus.BAD_REQUEST);
                    }
    
                    viviendasVerificadas[viviendaKey] = true;
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
                    if (persona.titular_cotitular === 'Titular' && lote) {
                        console.log(`📦 Creando lote para ${persona.nombre}...`);
                        const loteCreado = await queryRunner.manager.save(Lote, lote);
                        idLote = loteCreado.idLote;
                        console.log("✅ Lote creado:", loteCreado);
                    }
    
                    console.log(`👤 Creando persona ${persona.nombre} asociada a la vivienda ${viviendaReutilizada.idVivienda}...`);
                    const personaCreada = await queryRunner.manager.save(Persona, {
                        ...persona,
                        vivienda: viviendaReutilizada,
                        idLote
                    });
                    console.log("✅ Persona creada:", personaCreada);
    
                    if (ingresos && ingresos.length > 0) {
                        console.log(`💰 Creando ingresos para ${persona.nombre}...`);
                        for (const ingreso of ingresos) {
                            await queryRunner.manager.save(Ingreso, {
                                ...ingreso,
                                idPersona: personaCreada.idPersona
                            });
                        }
                        console.log("✅ Ingresos creados.");
                    }
    
                    createdPersonas.push(personaCreada);
                }
    
                console.log("✅ Todos los registros creados con éxito. Confirmando transacción...");
                await queryRunner.commitTransaction();
                console.log("🎉 Transacción confirmada. Personas creadas:", createdPersonas.length);
                return createdPersonas;

            }
        } catch (error) {
            console.error("❌ ERROR DETECTADO:", error.message);
            await queryRunner.rollbackTransaction();
            console.error("⏪ Transacción revertida.");
            throw new HttpException(`Error al crear las dependencias: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
            console.log("🔚 queryRunner liberado.");

        }
    }
    

}
