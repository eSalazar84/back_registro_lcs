import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';

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
      // PRIMERA PASADA: Verificaciones
      for (const personaData of personas) {
        const { persona, vivienda } = personaData;
        const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;

        if (
          vivienda.localidad !== 'El Luchador' &&
          vivienda.localidad !== 'Coronel Rodolfo Bunge' &&
          !viviendasVerificadas[viviendaKey]
        ) {
          const viviendaFound = await queryRunner.manager.findOne(Vivienda, {
            where: {
              direccion: vivienda.direccion,
              numero_direccion: vivienda.numero_direccion,
              localidad: vivienda.localidad,
              departamento: vivienda.departamento,
              piso_departamento: vivienda.piso_departamento,
              numero_departamento: vivienda.numero_departamento,
            }
          });

          if (viviendaFound) {
            throw new Error(`La vivienda en ${vivienda.direccion}, ${vivienda.numero_direccion} ya está registrada.`);
          }

          viviendasVerificadas[viviendaKey] = true;
        }

        const personaFound = await queryRunner.manager.findOne(Persona, {
          where: { dni: persona.dni }
        });

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

      // Crear vivienda (solo una por registro)
      let viviendaReutilizada = viviendasCreadas[viviendaKey];
      if (!viviendaReutilizada) {
        viviendaReutilizada = await this.viviendaService.createVivienda(vivienda);
        viviendasCreadas[viviendaKey] = viviendaReutilizada;
      }

      // Crear lote si corresponde
      let loteCreado = null;
      if (lote) {
        loteCreado = await this.loteService.createLote(lote);
      }

      // Crear el registro
      const registro = this.registroRepository.create({
        vivienda: viviendaReutilizada,
        lote: loteCreado ?? null,
        ingresos: [],
        personas: []
      });
      const registroGuardado = await this.registroRepository.save(registro);

      // Crear cada persona con el idRegistro
      for (const personaData of personas) {
        const { persona, ingresos } = personaData;

        const personaCreada = await this.personaService.createPersona(
          persona,
          viviendaReutilizada.idVivienda,
          loteCreado ? loteCreado.idLote : null,
          registroGuardado.idRegistro
        );

        createdPersonas.push(personaCreada);

        if (ingresos && ingresos.length > 0) {
          await this.ingresoService.createIngreso(ingresos, personaCreada.idPersona, registroGuardado.idRegistro);
        }

      }

      await queryRunner.commitTransaction();

      // Enviar email al titular
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

  async findOneByIdRegistro(id: number) {
    return await this.registroRepository.findOne({
      where: { idRegistro: id },
      relations: ['personas', 'vivienda', 'lote', 'personas.ingresos'],
    });
  }

  async update(idRegistro: number, updateDto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Obtener registro con relaciones
      const registro = await queryRunner.manager.findOne(Registro, {
        where: { idRegistro },
        relations: ['personas', 'vivienda', 'lote', 'personas.ingresos']
      });
  
      if (!registro) {
        throw new NotFoundException("Registro no encontrado");
      }
  
      // 1. Actualizar vivienda si existe
      if (updateDto.vivienda) {
        if (registro.vivienda) {
          await queryRunner.manager.update(
            Vivienda, 
            registro.vivienda.idVivienda, 
            updateDto.vivienda
          );
        } else {
          const nuevaVivienda = queryRunner.manager.create(Vivienda, updateDto.vivienda);
          registro.vivienda = await queryRunner.manager.save(nuevaVivienda);
        }
      }
  
      // 2. Actualizar lote si existe
      if (updateDto.lote) {
        if (registro.lote) {
          await queryRunner.manager.update(
            Lote, 
            registro.lote.idLote, 
            updateDto.lote
          );
        } else {
          const nuevoLote = queryRunner.manager.create(Lote, updateDto.lote);
          registro.lote = await queryRunner.manager.save(nuevoLote);
        }
      }
  
      // 3. Manejo de personas
      if (Array.isArray(updateDto.personas)) {
        const personasActuales = registro.personas || [];
        const personasActualesIds = personasActuales.map(p => p.idPersona);
  
        // A. Procesar nuevas personas
        const nuevasPersonasDtos = updateDto.personas.filter(p => !p.idPersona);
        for (const personaDto of nuevasPersonasDtos) {
          // SOLUCIÓN CLAVE: Crear persona sin asignar lote si ya está asignado
          const personaData = {
            ...personaDto,
            idRegistro: idRegistro,
            idVivienda: registro.vivienda?.idVivienda,
            // Solo asignar lote si no está ya asignado a otra persona
            idLote: registro.personas.some(p => p.idLote === registro.lote?.idLote) 
              ? null 
              : registro.lote?.idLote
          };
  
          const personaCreada = queryRunner.manager.create(Persona, personaData);
          const personaGuardada = await queryRunner.manager.save(personaCreada);
  
          // Crear ingresos si existen
          if (personaDto.ingresos) {
            const ingresos = Array.isArray(personaDto.ingresos) ? personaDto.ingresos : [personaDto.ingresos];
            for (const ingresoDto of ingresos) {
              const nuevoIngreso = queryRunner.manager.create(Ingreso, {
                ...ingresoDto,
                idPersona: personaGuardada.idPersona,
                idRegistro: idRegistro
              });
              await queryRunner.manager.save(nuevoIngreso);
            }
          }
  
          personasActuales.push(personaGuardada);
        }
  
        // B. Actualizar personas existentes
        const personasActualizarDtos = updateDto.personas.filter(p => p.idPersona && personasActualesIds.includes(p.idPersona));
        for (const personaDto of personasActualizarDtos) {
          // Actualizar sin modificar relaciones existentes
          const { ingresos, idVivienda, idLote, ...datosActualizar } = personaDto;
          await queryRunner.manager.update(
            Persona,
            personaDto.idPersona,
            datosActualizar
          );
  
          // Manejar ingresos
          if (ingresos) {
            const ingresosArray = Array.isArray(ingresos) ? ingresos : [ingresos];
            for (const ingresoDto of ingresosArray) {
              if (ingresoDto.idIngreso) {
                await queryRunner.manager.update(
                  Ingreso,
                  ingresoDto.idIngreso,
                  ingresoDto
                );
              } else {
                const nuevoIngreso = queryRunner.manager.create(Ingreso, {
                  ...ingresoDto,
                  idPersona: personaDto.idPersona,
                  idRegistro: idRegistro
                });
                await queryRunner.manager.save(nuevoIngreso);
              }
            }
          }
        }
  
        // Actualizar referencia en el registro
        registro.personas = personasActuales;
      }
  
      await queryRunner.manager.save(registro);
      await queryRunner.commitTransaction();
      return await this.findOneByIdRegistro(idRegistro);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error en actualización:", error);
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: "Error al actualizar registro",
        message: error.message
      }, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
  
  
  
  // Función auxiliar privada
  private async manejarIngresosPersona(
    personaDto: any,
    idPersona: number,
    idRegistro: number,
    manager: EntityManager
  ) {
    if (Array.isArray(personaDto.ingresos)) {
      const ingresosActuales = await this.ingresoService.findByPersona(idPersona);
      const nuevosIds = personaDto.ingresos.map(i => i.idIngreso).filter(Boolean);
  
      for (const ingresoDto of personaDto.ingresos) {
        if (ingresoDto.idIngreso) {
          await this.ingresoService.updateIngreso(ingresoDto.idIngreso, ingresoDto, manager);
        } else {
          await this.ingresoService.createIngreso([ingresoDto], idPersona, idRegistro, manager);
        }
      }
  
      for (const ingreso of ingresosActuales) {
        if (!nuevosIds.includes(ingreso.idIngreso)) {
          await this.ingresoService.removeIngreso(ingreso.idIngreso);
        }
      }
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
      const registrosRaw = await this.registroRepository.find({
        relations: {
          personas: {
            ingresos: true,
            vivienda: true,
            lote: true,
          },
          vivienda: true,
          lote: true
        },
        order: {
          idRegistro: 'ASC'
        }
      });

      let registros = registrosRaw.map(registro => {
        return {
          idRegistro: registro.idRegistro,
          vivienda: registro.vivienda ? {
            idVivienda: registro.vivienda.idVivienda,
            direccion: registro.vivienda.direccion,
            numero_direccion: registro.vivienda.numero_direccion,
            departamento: registro.vivienda.departamento,
            piso_departamento: registro.vivienda.piso_departamento,
            numero_departamento: registro.vivienda.numero_departamento,
            alquiler: registro.vivienda.alquiler,
            valor_alquiler: registro.vivienda.valor_alquiler,
            localidad: registro.vivienda.localidad,
            cantidad_dormitorios: registro.vivienda.cantidad_dormitorios,
            estado_vivienda: registro.vivienda.estado_vivienda,
            tipo_alquiler: registro.vivienda.tipo_alquiler
          } : null,
          lote: registro.lote ? {
            idLote: registro.lote.idLote,
            localidad: registro.lote.localidad
          } : null,
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
              vivienda: persona.vivienda ? {
                idVivienda: persona.vivienda.idVivienda,
                direccion: persona.vivienda.direccion,
                localidad: persona.vivienda.localidad
              } : null,
              lote: persona.lote ? {
                idLote: persona.lote.idLote,
                localidad: persona.lote.localidad
              } : null,
              ingresos: persona.ingresos.map(ingreso => ({
                idIngreso: ingreso.idIngreso,
                situacion_laboral: ingreso.situacion_laboral,
                ocupacion: ingreso.ocupacion,
                CUIT_empleador: ingreso.CUIT_empleador,
                salario: ingreso.salario
              })),
              totalIngresos
            };
          })
        };
      });

      // 🔍 Filtros
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

      // 🔡 Orden por apellido + nombre (del titular, si existe)
      registros.sort((a, b) => {
        const personaA = a.personas.find(p => p.titular_cotitular === 'Titular') || a.personas[0];
        const personaB = b.personas.find(p => p.titular_cotitular === 'Titular') || b.personas[0];
        const apellidoComparison = personaA.apellido.localeCompare(personaB.apellido);
        if (apellidoComparison !== 0) return apellidoComparison;
        return personaA.nombre.localeCompare(personaB.nombre);
      });

      // 📦 Paginación
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

  // registro.service.ts

async findOneByPersonaId(idPersona: number): Promise<Registro> {
  return this.registroRepository.findOne({
    where: { personas: { idPersona } },
    relations: ['vivienda','lote','personas','personas.ingresos']
  });
}

}


