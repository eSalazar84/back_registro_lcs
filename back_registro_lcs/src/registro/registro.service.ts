import { Injectable } from '@nestjs/common'; 
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

    async createAll(personas: { 
        persona: CreatePersonaDto, 
        vivienda: CreateViviendaDto, 
        ingresos?: CreateIngresoDto[], 
        lote?: CreateLoteDto 
    }[]): Promise<Persona[]> {
        console.log("🔹 Iniciando createAll. Cantidad de personas recibidas:", personas.length);
        const createdPersonas: Persona[] = [];
        const viviendasCreadas: { [key: string]: Vivienda } = {};
        const viviendasVerificadas: { [key: string]: boolean } = {};
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const personaData of personas) {
                const { persona, vivienda } = personaData;
                const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;

                console.log(`🔍 Verificando vivienda: ${viviendaKey}`);
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
                      console.error(`❌ ERROR: Vivienda ya registrada en ${viviendaKey}`);
                  
                      // Verificar si la vivienda es un departamento
                      if (vivienda.departamento) {
                        throw new Error(`El departamento en ${vivienda.direccion}, ${vivienda.numero_direccion},piso ${vivienda.piso_departamento} ${vivienda.numero_departamento} ya está registrado.`);
                      } else {
                        throw new Error(`La vivienda en ${vivienda.direccion}, ${vivienda.numero_direccion} ya está registrada.`);
                      }
                    }
                  
                    viviendasVerificadas[viviendaKey] = true;
                  }
                  
                console.log(`🔍 Verificando persona con DNI ${persona.dni}`);
                const personaFound = await queryRunner.manager.findOne(Persona, { where: { dni: persona.dni } });

                if (personaFound) {
                    console.error(`❌ ERROR: Persona con DNI ${persona.dni} ya existe.`);
                    throw new Error(`La persona con DNI ${persona.dni} ya está registrada.`);
                }

                const edad = this.calcularEdad(persona.fecha_nacimiento);
                if (persona.titular_cotitular === 'Titular' && edad < 18) {
                    console.error(`❌ ERROR: ${persona.nombre} es menor de edad y no puede ser titular.`);
                    throw new Error(`La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`);
                }
            }

            console.log("✅ Verificación completada. Procediendo a crear registros...");
            for (const personaData of personas) {
                const { persona, vivienda, ingresos, lote } = personaData;
                const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;

                console.log(`🏠 Creando vivienda para ${persona.nombre}...`);
                let viviendaReutilizada = viviendasCreadas[viviendaKey];
                if (!viviendaReutilizada) {
                    viviendaReutilizada = await this.viviendaService.createVivienda(vivienda);
                    viviendasCreadas[viviendaKey] = viviendaReutilizada;
                }

                let idLote: number | null = null;
                if (persona.titular_cotitular === 'Titular' && lote) {
                    console.log(`📦 Creando lote para ${persona.nombre}...`);
                    const loteCreado = await this.loteService.createLote(lote);
                    idLote = loteCreado.idLote;
                }

                console.log(`👤 Creando persona: ${persona.nombre} (DNI: ${persona.dni})...`);
                const personaCreada = await this.personaService.createPersona(persona, viviendaReutilizada.idVivienda, idLote);
                createdPersonas.push(personaCreada);

                if (ingresos && ingresos.length > 0) {
                    console.log(`💰 Registrando ingresos para ${persona.nombre}...`);
                    await this.ingresoService.createIngreso(ingresos, personaCreada.idPersona);
                }
            }

            console.log("✅ Todos los registros creados con éxito. Confirmando transacción...");
            await queryRunner.commitTransaction();

            console.log("📧 Enviando correo de confirmación...");
            const titularEmail = personas[0].persona.email;
            const nombreTitular = `${createdPersonas[0].nombre} ${createdPersonas[0].apellido}`;
            const numeroRegistro = createdPersonas[0].numero_registro;
            await this.mailserviceService.sendRegisterEmail(titularEmail, nombreTitular, numeroRegistro, createdPersonas);

            return createdPersonas;
        } catch (error) {
            console.error("❌ ERROR DETECTADO:", error.message);
            await queryRunner.rollbackTransaction();
            throw new Error(` ${error.message}`);
        } finally {
            console.log("🔚 queryRunner liberado.");
            await queryRunner.release();
        }
    }
}
