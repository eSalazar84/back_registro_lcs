import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'; 
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
import { Vivienda } from 'src/vivienda/entities/vivienda.entity'
import { DataSource } from 'typeorm';
import { Titular_Cotitular } from 'src/persona/enum/titular_cotitular.enum';

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
                if (persona.titular_cotitular === 'Titular' && edad <= 18) {
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



    async update(id: number, updateDto: any) {
      try {
        const personaExistente = await this.personaService.findOneById(id);
        if (!personaExistente) {
          throw new NotFoundException("Persona no encontrada");
        }
    
        // Actualizar vivienda
        if (updateDto.vivienda) {
          try {
            await this.viviendaService.updateVivienda(
              personaExistente.vivienda.idVivienda,
              updateDto.vivienda
            );
          } catch (error) {
            console.error("Error al actualizar la vivienda:", error);
            throw new HttpException(
              {
                status: HttpStatus.CONFLICT,
                error: "Error al actualizar la vivienda",
                message: error.message || 'La vivienda ya está registrada',
              },
              HttpStatus.CONFLICT
            );
          }
        }
    
        // Manejo de ingresos
        if (updateDto.ingresos && Array.isArray(updateDto.ingresos)) {
          console.log("Ingresos recibidos:", updateDto.ingresos);
          
          for (const nuevoIngreso of updateDto.ingresos) {
            if (nuevoIngreso.idIngreso) {
              // Actualizar ingreso existente
              console.log(`Actualizando ingreso ID ${nuevoIngreso.idIngreso}`);
              await this.ingresoService.updateIngreso(nuevoIngreso.idIngreso, nuevoIngreso);
            } else {
              // Crear nuevo ingreso
              console.log('Creando nuevo ingreso');
              await this.ingresoService.createIngreso([nuevoIngreso], id);
            }
          }
    
          // Eliminar solo los ingresos que ya no existen en la nueva lista
          const ingresosActuales = personaExistente.ingresos || [];
          const nuevosIds = updateDto.ingresos.map(i => i.idIngreso).filter(id => id != null);
          
          for (const ingresoActual of ingresosActuales) {
            if (!nuevosIds.includes(ingresoActual.idIngreso)) {
              console.log(`Eliminando ingreso ID ${ingresoActual.idIngreso}`);
              await this.ingresoService.removeIngreso(ingresoActual.idIngreso);
            }
          }
        }
    
        // Actualizar lote si es titular
        if (updateDto.lote && personaExistente.titular_cotitular === Titular_Cotitular.Titular) {
          await this.loteService.updateLote(personaExistente.lote.idLote, updateDto.lote);
        }
    
        // Actualizar persona
        await this.personaService.updatePersona(id, updateDto.persona);
    
        return await this.personaService.findOneById(id);
      } catch (error) {
        console.error("Error en la actualización:", error);
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: "Error en la actualización",
            message: error.message,
          },
          HttpStatus.BAD_REQUEST
        );
      }
    }
    
    
    
      async findAll(options?: {
        page?: number;
        limit?: number;
        search?: string;
        localidad?: string;
        titular?: boolean;
    }) {
        try {
            // Obtener todas las personas con sus relaciones
            const personas = await this.personaService.findAll();

            // Transformar y estructurar los datos
            let registros = personas.map(persona => {
                // Calcular el total de ingresos
                const totalIngresos = persona.ingresos
                    ? persona.ingresos.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0)
                    : 0;

                return {
                    persona: {
                        idPersona: persona.idPersona,
                        numero_registro: persona.numero_registro,
                        nombre: persona.nombre,
                        apellido: persona.apellido,
                        tipo_dni: persona.tipo_dni,
                        dni: persona.dni,
                        CUIL_CUIT: persona.CUIL_CUIT,
                        genero: persona.genero,
                        fecha_nacimiento: persona.fecha_nacimiento,
                        email: persona.email,
                        telefono: persona.telefono,
                        estado_civil: persona.estado_civil,
                        nacionalidad: persona.nacionalidad,
                        certificado_discapacidad: persona.certificado_discapacidad,
                        rol: persona.rol,
                        vinculo: persona.vinculo,
                        titular_cotitular: persona.titular_cotitular
                    },
                    vivienda: persona.vivienda ? {
                        idVivienda: persona.vivienda.idVivienda,
                        direccion: persona.vivienda.direccion,
                        numero_direccion: persona.vivienda.numero_direccion,
                        departamento: persona.vivienda.departamento,
                        piso_departamento: persona.vivienda.piso_departamento,
                        numero_departamento: persona.vivienda.numero_departamento,
                        alquiler: persona.vivienda.alquiler,
                        valor_alquiler: persona.vivienda.valor_alquiler,
                        localidad: persona.vivienda.localidad,
                        cantidad_dormitorios: persona.vivienda.cantidad_dormitorios,
                        estado_vivienda: persona.vivienda.estado_vivienda,
                        tipo_alquiler: persona.vivienda.tipo_alquiler
                    } : null,
                    lote: persona.lote ? {
                        idLote: persona.lote.idLote,
                        localidad: persona.lote.localidad
                    } : null,
                    ingresos: persona.ingresos ? persona.ingresos.map(ingreso => ({
                        idIngreso: ingreso.idIngreso,
                        situacion_laboral: ingreso.situacion_laboral,
                        ocupacion: ingreso.ocupacion,
                        CUIT_empleador: ingreso.CUIT_empleador,
                        salario: ingreso.salario
                    })) : [],
                    totalIngresos
                };
            });

            // Aplicar filtros si existen
            if (options?.search) {
                const searchLower = options.search.toLowerCase();
                registros = registros.filter(registro => 
                    registro.persona.nombre.toLowerCase().includes(searchLower) ||
                    registro.persona.apellido.toLowerCase().includes(searchLower) ||
                    registro.persona.dni.toString().includes(options.search)
                );
            }

            if (options?.localidad) {
                registros = registros.filter(registro => 
                    registro.vivienda?.localidad === options.localidad
                );
            }

            if (options?.titular !== undefined) {
                registros = registros.filter(registro => 
                    registro.persona.titular_cotitular === (options.titular ? 'Titular' : 'Cotitular')
                );
            }

            // Ordenar por apellido y nombre
            registros.sort((a, b) => {
                const apellidoComparison = a.persona.apellido.localeCompare(b.persona.apellido);
                if (apellidoComparison !== 0) return apellidoComparison;
                return a.persona.nombre.localeCompare(b.persona.nombre);
            });

            // Calcular paginación
            const total = registros.length;
            if (options?.page && options?.limit) {
                const start = (options.page - 1) * options.limit;
                const end = start + options.limit;
                registros = registros.slice(start, end);
            }

            

            return {
                status: HttpStatus.OK,
                message: 'Registros obtenidos exitosamente',
                data: registros,
                total,
                page: options?.page || 1,
                limit: options?.limit || total,
                totalPages: options?.limit ? Math.ceil(total / options.limit) : 1
            };

        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Error al obtener los registros',
                message: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOneById(id: number) {
      try {
          // Obtener la persona con todas sus relaciones
          const persona = await this.personaService.findOneById(id);

          if (!persona) {
              throw new NotFoundException(`No se encontró el registro con ID ${id}`);
          }

          // Estructurar la respuesta
          const registro = {
              persona: {
                  idPersona: persona.idPersona,
                  numero_registro: persona.numero_registro,
                  nombre: persona.nombre,
                  apellido: persona.apellido,
                  tipo_dni: persona.tipo_dni,
                  dni: persona.dni,
                  CUIL_CUIT: persona.CUIL_CUIT,
                  genero: persona.genero,
                  fecha_nacimiento: persona.fecha_nacimiento,
                  email: persona.email,
                  telefono: persona.telefono,
                  estado_civil: persona.estado_civil,
                  nacionalidad: persona.nacionalidad,
                  certificado_discapacidad: persona.certificado_discapacidad,
                  rol: persona.rol,
                  vinculo: persona.vinculo,
                  titular_cotitular: persona.titular_cotitular
              },
              vivienda: persona.vivienda ? {
                  idVivienda: persona.vivienda.idVivienda,
                  direccion: persona.vivienda.direccion,
                  numero_direccion: persona.vivienda.numero_direccion,
                  departamento: persona.vivienda.departamento,
                  piso_departamento: persona.vivienda.piso_departamento,
                  numero_departamento: persona.vivienda.numero_departamento,
                  alquiler: persona.vivienda.alquiler,
                  valor_alquiler: persona.vivienda.valor_alquiler,
                  localidad: persona.vivienda.localidad,
                  cantidad_dormitorios: persona.vivienda.cantidad_dormitorios,
                  estado_vivienda: persona.vivienda.estado_vivienda,
                  tipo_alquiler: persona.vivienda.tipo_alquiler
              } : null,
              lote: persona.lote ? {
                  idLote: persona.lote.idLote,
                  localidad: persona.lote.localidad
              } : null,
              ingresos: persona.ingresos ? persona.ingresos.map(ingreso => ({
                  idIngreso: ingreso.idIngreso,
                  situacion_laboral: ingreso.situacion_laboral,
                  ocupacion: ingreso.ocupacion,
                  CUIT_empleador: ingreso.CUIT_empleador,
                  salario: ingreso.salario
              })) : [],
              totalIngresos: persona.ingresos
                  ? persona.ingresos.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0)
                  : 0
          };

          return {
              status: HttpStatus.OK,
              message: 'Registro obtenido exitosamente',
              data: registro
          };

      } catch (error) {
          if (error instanceof NotFoundException) {
              throw error;
          }
          throw new HttpException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: 'Error al obtener el registro',
              message: error.message
          }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  async findByViviendaId(idVivienda: number) {
    try {
      // Obtener la vivienda con todas sus relaciones
      const vivienda = await this.viviendaService.findOneWithRelations(idVivienda);
  
      if (!vivienda) {
        throw new NotFoundException(`No se encontró la vivienda con ID ${idVivienda}`);
      }
  
      // Obtener todas las personas que viven en esta vivienda con sus relaciones
      const personas = await this.personaService.findByViviendaId(idVivienda);
  
      // Estructurar la respuesta
      const registro = {
        vivienda: {
          idVivienda: vivienda.idVivienda,
          direccion: vivienda.direccion,
          numero_direccion: vivienda.numero_direccion,
          departamento: vivienda.departamento,
          piso_departamento: vivienda.piso_departamento,
          numero_departamento: vivienda.numero_departamento,
          alquiler: vivienda.alquiler,
          valor_alquiler: vivienda.valor_alquiler,
          localidad: vivienda.localidad,
          cantidad_dormitorios: vivienda.cantidad_dormitorios,
          estado_vivienda: vivienda.estado_vivienda,
          tipo_alquiler: vivienda.tipo_alquiler
        },
        habitantes: personas.map(persona => ({
          persona: {
            idPersona: persona.idPersona,
            numero_registro: persona.numero_registro,
            nombre: persona.nombre,
            apellido: persona.apellido,
            tipo_dni: persona.tipo_dni,
            dni: persona.dni,
            CUIL_CUIT: persona.CUIL_CUIT,
            genero: persona.genero,
            fecha_nacimiento: persona.fecha_nacimiento,
            email: persona.email,
            telefono: persona.telefono,
            estado_civil: persona.estado_civil,
            nacionalidad: persona.nacionalidad,
            certificado_discapacidad: persona.certificado_discapacidad,
            rol: persona.rol,
            vinculo: persona.vinculo,
            titular_cotitular: persona.titular_cotitular
          },
          ingresos: persona.ingresos ? persona.ingresos.map(ingreso => ({
            idIngreso: ingreso.idIngreso,
            situacion_laboral: ingreso.situacion_laboral,
            ocupacion: ingreso.ocupacion,
            CUIT_empleador: ingreso.CUIT_empleador,
            salario: ingreso.salario
          })) : [],
          lote: persona.lote ? {
            idLote: persona.lote.idLote,
            localidad: persona.lote.localidad
          } : null,
          totalIngresos: persona.ingresos
            ? persona.ingresos.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0)
            : 0
        })),
        totalIngresosVivienda: personas.reduce((total, persona) => {
          const personaIngresos = persona.ingresos
            ? persona.ingresos.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0)
            : 0;
          return total + personaIngresos;
        }, 0)
      };
  
      return {
        status: HttpStatus.OK,
        message: 'Registro de vivienda obtenido exitosamente',
        data: registro
      };
  
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error al obtener el registro de la vivienda',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
