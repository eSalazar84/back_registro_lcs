
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

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

import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Titular_Cotitular } from 'src/persona/enum/titular_cotitular.enum';
import { Registro } from './entities/registro.entity';
import { Lote } from 'src/lote/entities/lote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { Localidad } from 'src/lote/enum/localidad.enum';
import { Estado_vivienda } from 'src/vivienda/enum/estado_vivienda.enum';
import { UpdatePersonaDto } from 'src/persona/dto/update-persona.dto';
import { UpdateIngresoDto } from 'src/ingreso/dto/update-ingreso.dto';
import { UpdateLoteDto } from 'src/lote/dto/update-lote.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';

@Injectable()
export class RegistroService {
  constructor(
    private readonly personaService: PersonaService,
    private readonly viviendaService: ViviendaService,
    private readonly loteService: LoteService,
    private readonly ingresoService: IngresoService,
    private readonly mailserviceService: MailserviceService,
    private readonly dataSource: DataSource,
    @InjectRepository(Registro)
    private readonly registroRepository: Repository<Registro>
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

  async createRegistro(personas: {
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
      // PRIMERA PASADA: Verificaciones
      for (const personaData of personas) {
        const { persona, vivienda } = personaData;
        const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;

        if (
          vivienda.localidad !== 'El Luchador' &&
          vivienda.localidad !== 'Coronel Rodolfo Bunge' &&
          !viviendasVerificadas[viviendaKey]
        ) {
          const viviendaFound = await this.viviendaService.findByAddressWithManager(
            vivienda.direccion,
            vivienda.numero_direccion,
            vivienda.localidad,
            vivienda.departamento,
            vivienda.piso_departamento,
            vivienda.numero_departamento,
            queryRunner.manager
          );

          if (viviendaFound) {
            throw new Error(`La vivienda en ${vivienda.direccion}, ${vivienda.numero_direccion} ya está registrada.`);
          }

          viviendasVerificadas[viviendaKey] = true;
        }

        const personaFound = await this.personaService.findOneByDniWithManager(persona.dni, queryRunner.manager);


        if (personaFound) {
          throw new Error(`La persona con DNI ${persona.dni} ya está registrada.`);
        }

        const edad = this.calcularEdad(persona.fecha_nacimiento);
        if (persona.titular_cotitular === 'Titular' && edad <= 18) {
          throw new Error(`La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`);
        }
      }

      // SEGUNDA PASADA: Creación
      const { vivienda, lote } = personas[0];
      const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;

      let viviendaReutilizada = viviendasCreadas[viviendaKey];
      if (!viviendaReutilizada) {
        viviendaReutilizada = await this.viviendaService.createVivienda(vivienda, queryRunner.manager);
        viviendasCreadas[viviendaKey] = viviendaReutilizada;
      }

      let loteCreado = null;
      if (lote) {
        loteCreado = await this.loteService.createLote(lote);
      }

      const registro = this.registroRepository.create({
        viviendas: [viviendaReutilizada],
        personas: []
      });

      const registroGuardado = await queryRunner.manager.save(registro);

      for (const personaData of personas) {
        const { persona, ingresos } = personaData;

        const personaCreada = await this.personaService.createPersona(
          persona,
          viviendaReutilizada.idVivienda,
          loteCreado ? loteCreado.idLote : null,
          registroGuardado.idRegistro,
          queryRunner.manager
        );

        createdPersonas.push(personaCreada);

        if (ingresos && ingresos.length > 0) {
          await this.ingresoService.createIngreso(ingresos, personaCreada.idPersona, queryRunner.manager);
        }
      }

      await queryRunner.commitTransaction();

      const titularEmail = personas[0].persona.email;
      const nombreTitular = `${createdPersonas[0].nombre} ${createdPersonas[0].apellido}`;
      const numeroRegistro = createdPersonas[0].numero_registro;
      await this.mailserviceService.sendRegisterEmail(titularEmail, nombreTitular, numeroRegistro, createdPersonas);

      return createdPersonas;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`❌ Error al crear registros: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }



  // async findOneByIdRegistro(id: number) {
  //   return await this.registroRepository.findOne({
  //     where: { idRegistro: id },
  //     relations: ['personas', 'viviendas', 'lote', 'personas.ingresos'],
  //   });
  // }
  // async updateRegistro(idRegistro: number, updateDto: UpdateRegistroDto): Promise<Registro> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     // Buscar el registro existente con todas las relaciones necesarias
  //     const registro = await queryRunner.manager.findOne(Registro, {
  //       where: { idRegistro },
  //       relations: ['personas', 'personas.ingresos', 'vivienda', 'lote']
  //     });

  //     if (!registro) throw new NotFoundException(`Registro ${idRegistro} no encontrado`);

  //     // 1. Actualizar o crear vivienda
  //     if (updateDto.vivienda) {
  //       if (updateDto.vivienda.idVivienda) {
  //         // Actualizar vivienda existente
  //         const viviendaActualizada = await this.viviendaService.updateVivienda(
  //           updateDto.vivienda.idVivienda,
  //           updateDto.vivienda,
  //           queryRunner.manager
  //         );
  //         registro.vivienda = viviendaActualizada;
  //       } else {

  //         const viviendaDto: CreateViviendaDto = {
  //           ...updateDto.vivienda,
  //           direccion: updateDto.vivienda.direccion, // obligatorio
  //           numero_direccion: updateDto.vivienda.numero_direccion, // obligatorio
  //           departamento: updateDto.vivienda.departamento ?? false,
  //           piso_departamento: updateDto.vivienda.piso_departamento ?? 0,
  //           numero_departamento: updateDto.vivienda.numero_departamento ?? '',
  //           alquiler: updateDto.vivienda.alquiler ?? false, // obligatorio
  //           valor_alquiler: updateDto.vivienda.valor_alquiler ?? 0,
  //           localidad: updateDto.vivienda.localidad, // obligatorio
  //           cantidad_dormitorios: updateDto.vivienda.cantidad_dormitorios ?? 0, // obligatorio
  //           estado_vivienda: updateDto.vivienda.estado_vivienda, // obligatorio
  //           tipo_alquiler: updateDto.vivienda.tipo_alquiler ?? null
  //         };

  //         const nuevaVivienda = await this.viviendaService.createVivienda(
  //          viviendaDto,
  //           queryRunner.manager
  //         );
  //         registro.vivienda = nuevaVivienda;
  //       }
  //     }



  //     // 2. Procesar personas
  //     const personasToKeep: number[] = [];
  //     const updatedPersonas: Persona[] = [];

  //     for (const personaDto of updateDto.personas) {
  //       let personaActualizada: Persona;

  //       if (personaDto.idPersona) {
  //         // PERSONA EXISTENTE
  //         // Actualizar datos básicos de la persona
  //         const { ingresos = [], ...personaData } = personaDto;
  //         personaActualizada = await this.personaService.updatePersona(
  //           personaDto.idPersona,
  //           personaData,
  //           idRegistro,
  //           queryRunner.manager
  //         );

  //         // Procesar ingresos existentes y nuevos
  //         const ingresosActuales = registro.personas
  //           .find(p => p.idPersona === personaDto.idPersona)?.ingresos || [];

  //         // Eliminar ingresos que ya no están en el DTO
  //         const ingresosAEliminar = ingresosActuales.filter(
  //           ia => !ingresos.some(ni => ni.idIngreso === ia.idIngreso)
  //         );
  //         for (const ingreso of ingresosAEliminar) {
  //           await queryRunner.manager.delete(Ingreso, ingreso.idIngreso);
  //         }

  //         // Actualizar/Crear ingresos
  //         for (const ingresoDto of ingresos) {
  //           if (ingresoDto.idIngreso) {
  //             // Actualizar ingreso existente
  //             await queryRunner.manager.update(
  //               Ingreso,
  //               ingresoDto.idIngreso,
  //               {
  //                 ...ingresoDto,
  //                 idPersona: personaDto.idPersona // Mantener relación
  //               }
  //             );
  //           } else {
  //             // Crear nuevo ingreso
  //             const nuevoIngreso = queryRunner.manager.create(Ingreso, {
  //               ...ingresoDto,
  //               idPersona: personaDto.idPersona,
  //               idRegistro: idRegistro
  //             });
  //             await queryRunner.manager.save(nuevoIngreso);
  //           }
  //         }

  //       } else {
  //         // NUEVA PERSONA
  //         const { ingresos = [], ...personaData } = personaDto;

  //         // Crear persona
  //         personaActualizada = await this.personaService.createPersona(
  //           personaData as CreatePersonaDto,
  //           registro.vivienda?.idVivienda,
  //           registro.lote?.idLote,
  //           idRegistro,
  //           queryRunner.manager
  //         );

  //         // Crear ingresos para la nueva persona
  //         for (const ingresoDto of ingresos) {
  //           const nuevoIngreso = queryRunner.manager.create(Ingreso, {
  //             ...ingresoDto,
  //             idPersona: personaActualizada.idPersona,
  //             idRegistro: idRegistro
  //           });
  //           await queryRunner.manager.save(nuevoIngreso);
  //         }
  //       }

  //       // Recargar persona con relaciones actualizadas
  //       const personaCompleta = await queryRunner.manager.findOne(Persona, {
  //         where: { idPersona: personaActualizada.idPersona },
  //         relations: ['ingresos']
  //       });

  //       if (personaCompleta) {
  //         updatedPersonas.push(personaCompleta);
  //         personasToKeep.push(personaCompleta.idPersona);
  //       }
  //     }

  //     // 3. Eliminar personas que no están en el DTO
  //     const personasAEliminar = registro.personas
  //       .filter(p => !personasToKeep.includes(p.idPersona));

  //     for (const persona of personasAEliminar) {
  //       await queryRunner.manager.delete(Persona, persona.idPersona);
  //     }

  //     // 4. Actualizar el registro
  //     registro.personas = updatedPersonas;
  //     const registroActualizado = await queryRunner.manager.save(registro);



  //     await queryRunner.commitTransaction();
  //     return registroActualizado;

  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     console.error("Error en updateRegistro:", err);
  //     throw new HttpException({
  //       status: HttpStatus.BAD_REQUEST,
  //       error: "Error al actualizar registro",
  //       message: err.message
  //     }, HttpStatus.BAD_REQUEST);
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
  async updateRegistro(idRegistro: number, updateDto: UpdateRegistroDto): Promise<Registro> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Buscar el registro existente con todas las relaciones necesarias
      const registro = await queryRunner.manager.findOne(Registro, {
        where: { idRegistro },
        relations: ['personas', 'personas.ingresos', 'viviendas', 'personas.lote'] // Corregir el acceso a viviendas y lote
      });
  
      if (!registro) throw new NotFoundException(`Registro ${idRegistro} no encontrado`);
      if (!Array.isArray(updateDto.personas)) {
        throw new Error('El campo personas debe ser un array');
      }
      // 1. Actualizar o crear vivienda
      if (updateDto.vivienda) {
        for (const viviendaDto of updateDto.vivienda) {
          if (viviendaDto.idVivienda) {
            // Actualizar vivienda existente
            const viviendaActualizada = await this.viviendaService.updateVivienda(
              viviendaDto.idVivienda,
              viviendaDto,
              queryRunner.manager
            );
            registro.viviendas.push(viviendaActualizada);  // Usamos push porque 'viviendas' es un array
          } else {
            // Crear nueva vivienda
            const nuevaVivienda = await this.viviendaService.createVivienda(viviendaDto as CreateViviendaDto, queryRunner.manager);
            registro.viviendas.push(nuevaVivienda);  // Usamos push para agregarla al array
          }
        }
      }
  
      // 2. Procesar personas
      const personasToKeep: number[] = [];
      const updatedPersonas: Persona[] = [];
  
      for (const personaDto of updateDto.personas) {
        let personaActualizada: Persona;
  
        if (personaDto.idPersona) {
          // PERSONA EXISTENTE
          const { ingresos = [], ...personaData } = personaDto;
  
          // Actualizar persona existente
          personaActualizada = await this.personaService.updatePersona(
            personaDto.idPersona,
            personaData,
            idRegistro,
            queryRunner.manager
          );
  
          // Procesar ingresos existentes y nuevos
          const ingresosActuales = registro.personas.find(p => p.idPersona === personaDto.idPersona)?.ingresos || [];
  
          // Eliminar ingresos que ya no están en el DTO
          const ingresosAEliminar = ingresosActuales.filter(ia => !ingresos.some(ni => ni.idIngreso === ia.idIngreso));
          for (const ingreso of ingresosAEliminar) {
            await queryRunner.manager.delete(Ingreso, ingreso.idIngreso);
          }
  
          // Actualizar/Crear ingresos
          for (const ingresoDto of ingresos) {
            if (ingresoDto.idIngreso) {
              // Actualizar ingreso existente
              await queryRunner.manager.update(Ingreso, ingresoDto.idIngreso, {
                ...ingresoDto,
                idPersona: personaDto.idPersona // Mantener relación
              });
            } else {
              // Crear nuevo ingreso
              const nuevoIngreso = queryRunner.manager.create(Ingreso, {
                ...ingresoDto,
                idPersona: personaDto.idPersona,
                idRegistro: idRegistro
              });
              await queryRunner.manager.save(nuevoIngreso);
            }
          }
  
        } else {
          // NUEVA PERSONA
          const { ingresos = [], ...personaData } = personaDto;
  
          // Crear nueva persona
          personaActualizada = await this.personaService.createPersona(
            personaData as CreatePersonaDto,
            personaDto.idVivienda || registro.viviendas[0]?.idVivienda, // Asociar a nueva o existente vivienda
            personaDto.idLote || registro.personas[0]?.lote?.idLote,  // Asociar a lote si existe
            idRegistro,
            queryRunner.manager
          );
  
          // Crear ingresos para la nueva persona
          for (const ingresoDto of ingresos) {
            const nuevoIngreso = queryRunner.manager.create(Ingreso, {
              ...ingresoDto,
              idPersona: personaActualizada.idPersona,
              idRegistro: idRegistro
            });
            await queryRunner.manager.save(nuevoIngreso);
          }
        }
  
        // Recargar persona con relaciones actualizadas
        const personaCompleta = await queryRunner.manager.findOne(Persona, {
          where: { idPersona: personaActualizada.idPersona },
          relations: ['ingresos']
        });
  
        if (personaCompleta) {
          updatedPersonas.push(personaCompleta);
          personasToKeep.push(personaCompleta.idPersona);
        }
      }
  
      // 3. Eliminar personas que no están en el DTO
      const personasAEliminar = registro.personas.filter(p => !personasToKeep.includes(p.idPersona));
      for (const persona of personasAEliminar) {
        await queryRunner.manager.delete(Persona, persona.idPersona);
      }
  
      // 4. Actualizar el registro
      registro.personas = updatedPersonas;
      const registroActualizado = await queryRunner.manager.save(registro);
  
      await queryRunner.commitTransaction();
      return registroActualizado;
  
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error("Error en updateRegistro:", err);
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: "Error al actualizar registro",
        message: err.message
      }, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
  
  
  
  


  async findAllRegistros(options?: {
    page?: number;
    limit?: number;
    search?: string;
    localidad?: string;
    titular?: boolean;
  }) {
    try {
      // Consulta para obtener los registros, sin la relación 'lote' directa en 'registro'.
      const registrosRaw = await this.registroRepository.find({
        relations: {
          personas: {
            ingresos: true,
            viviendas: true,
            lote: true,  // Cargar 'lote' a través de la relación 'persona'
          },
          viviendas: true, // Relación con viviendas
        },
        order: {
          idRegistro: 'ASC'
        }
      });

      let registros = registrosRaw.map(registro => {
        // Tomar la primera vivienda como principal (o null si no hay)
        const viviendaPrincipal = registro.viviendas?.length > 0 ? registro.viviendas[0] : null;

        return {
          idRegistro: registro.idRegistro,
          vivienda: viviendaPrincipal ? { // Mantenemos vivienda en singular en la respuesta
            idVivienda: viviendaPrincipal.idVivienda,
            direccion: viviendaPrincipal.direccion,
            numero_direccion: viviendaPrincipal.numero_direccion,
            departamento: viviendaPrincipal.departamento,
            piso_departamento: viviendaPrincipal.piso_departamento,
            numero_departamento: viviendaPrincipal.numero_departamento,
            alquiler: viviendaPrincipal.alquiler,
            valor_alquiler: viviendaPrincipal.valor_alquiler,
            localidad: viviendaPrincipal.localidad,
            cantidad_dormitorios: viviendaPrincipal.cantidad_dormitorios,
            estado_vivienda: viviendaPrincipal.estado_vivienda,
            tipo_alquiler: viviendaPrincipal.tipo_alquiler
          } : null,
          viviendas: registro.viviendas?.map(v => ({ // Opcional: incluir todas las viviendas
            idVivienda: v.idVivienda,
            direccion: v.direccion,
            localidad: v.localidad
          })) || [],
          personas: registro.personas.map(persona => {
            const totalIngresos = persona.ingresos?.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0) || 0;
            return {
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
              titular_cotitular: persona.titular_cotitular,
              vivienda: persona.viviendas ? {
                idVivienda: persona.viviendas.idVivienda,
                direccion: persona.viviendas.direccion,
                localidad: persona.viviendas.localidad
              } : null,
              lote: persona.lote ? {
                idLote: persona.lote.idLote,
                localidad: persona.lote.localidad
              } : null,
              ingresos: persona.ingresos?.map(ingreso => ({
                idIngreso: ingreso.idIngreso,
                situacion_laboral: ingreso.situacion_laboral,
                ocupacion: ingreso.ocupacion,
                CUIT_empleador: ingreso.CUIT_empleador,
                salario: ingreso.salario
              })) || [],
              totalIngresos
            };
          })
        };
      });

      // 🔍 Filtros (sin cambios)
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        registros = registros.filter(registro =>
          registro.personas.some(p =>
            p.nombre.toLowerCase().includes(searchLower) ||
            p.apellido.toLowerCase().includes(searchLower) ||
            p.dni.toString().includes(options.search)
          )
        );
      }

      if (options?.localidad) {
        registros = registros.filter(registro =>
          registro.vivienda?.localidad === options.localidad
        );
      }

      if (options?.titular !== undefined) {
        registros = registros.filter(registro =>
          registro.personas.some(p =>
            p.titular_cotitular === (options.titular ? 'Titular' : 'Cotitular')
          )
        );
      }

      // 🔡 Orden (sin cambios)
      registros.sort((a, b) => {
        const personaA = a.personas.find(p => p.titular_cotitular === 'Titular') || a.personas[0];
        const personaB = b.personas.find(p => p.titular_cotitular === 'Titular') || b.personas[0];
        const apellidoComparison = personaA.apellido.localeCompare(personaB.apellido);
        if (apellidoComparison !== 0) return apellidoComparison;
        return personaA.nombre.localeCompare(personaB.nombre);
      });

      // 📦 Paginación (sin cambios)
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
      console.error("❌ Error en findAll:", error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error al obtener los registros',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByIdRegistro(id: number) {
    try {
      // Obtener el registro con todas sus relaciones (personas, viviendas, ingresos)
      const registro = await this.registroRepository.findOne({
        where: { idRegistro: id },
        relations: {
          personas: {
            ingresos: true,
            viviendas: true,
            lote: true
          },
          viviendas: true, // Relación de viviendas del registro
        }
      });

      if (!registro) {
        throw new NotFoundException(`No se encontró el registro con ID ${id}`);
      }

      // Estructurar la respuesta
      const resultado = {
        idRegistro: registro.idRegistro,
        viviendas: registro.viviendas?.map(vivienda => ({
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
        })) || [],
        personas: registro.personas.map(persona => ({
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
          titular_cotitular: persona.titular_cotitular,
          vivienda: persona.viviendas ? {
            idVivienda: persona.viviendas.idVivienda,
            direccion: persona.viviendas.direccion,
            localidad: persona.viviendas.localidad
          } : null,
          lote: persona.lote ? {
            idLote: persona.lote.idLote,
            localidad: persona.lote.localidad
          } : null,
          ingresos: persona.ingresos?.map(ingreso => ({
            idIngreso: ingreso.idIngreso,
            situacion_laboral: ingreso.situacion_laboral,
            ocupacion: ingreso.ocupacion,
            CUIT_empleador: ingreso.CUIT_empleador,
            salario: ingreso.salario
          })) || [],
          totalIngresos: persona.ingresos?.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0) || 0
        }))
      };

      return {
        status: HttpStatus.OK,
        message: 'Registro obtenido exitosamente',
        data: resultado
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


  // registro.service.ts

  // async findOneByPersonaId(idPersona: number): Promise<Registro> {
  //   return this.registroRepository.findOne({
  //     where: { personas: { idPersona } },
  //     relations: ['viviendas', 'lote', 'personas', 'personas.ingresos']
  //   });
  // }

}



