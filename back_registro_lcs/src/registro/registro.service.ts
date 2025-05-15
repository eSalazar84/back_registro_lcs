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
import { UpdateRegistroArrayDto, UpdateRegistroDto } from './dto/update-registro.dto';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { UpdatePersonaDto } from 'src/persona/dto/update-persona.dto';
import { UpdateViviendaDto } from 'src/vivienda/dto/update-vivienda.dto';
import { UpdateIngresoDto } from 'src/ingreso/dto/update-ingreso.dto';
import { UpdateLoteDto } from 'src/lote/dto/update-lote.dto';

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
        personas: registro.personas.map(persona => ({
          idRegistro: persona.idRegistro,
          idPersona: persona.idPersona,
          idVivienda: persona.idVivienda,
          idLote: persona.idLote,
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
          vinculo: persona.vinculo,
          titular_cotitular: persona.titular_cotitular,
          vivienda: persona.viviendas ? {
            idVivienda: persona.viviendas.idVivienda,
            idRegistro: persona.viviendas.idRegistro,
            direccion: persona.viviendas.direccion,
            numero_direccion: persona.viviendas.numero_direccion,
            departamento: persona.viviendas.departamento,
            piso_departamento: persona.viviendas.piso_departamento,
            numero_departamento: persona.viviendas.numero_departamento,
            alquiler: persona.viviendas.alquiler,
            valor_alquiler: persona.viviendas.valor_alquiler,
            localidad: persona.viviendas.localidad,
            cantidad_dormitorios: persona.viviendas.cantidad_dormitorios,
            estado_vivienda: persona.viviendas.estado_vivienda,
            tipo_alquiler: persona.viviendas.tipo_alquiler
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

  async updateRegistro(
    idRegistro: number,
    personas: {
      persona: UpdatePersonaDto,
      vivienda: UpdateViviendaDto,
      ingresos?: UpdateIngresoDto[],
      lote?: UpdateLoteDto
    }[]
  ): Promise<Persona[]> {
    const viviendasCreadas: { [key: string]: Vivienda } = {};
    const viviendasVerificadas: { [key: string]: boolean } = {};
    const personasProcesadas: Persona[] = [];
  
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const registro = await queryRunner.manager.findOne(Registro, {
        where: { idRegistro },
        relations: ['personas', 'viviendas', 'personas.lote', 'personas.ingresos'],
      });
  
      if (!registro) throw new NotFoundException('Registro no encontrado');
  
      // Validaciones
      for (const item of personas) {
        const { persona, vivienda } = item;
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
  
          if (viviendaFound && !vivienda.idVivienda) {
            throw new Error(`La vivienda en ${vivienda.direccion}, ${vivienda.numero_direccion} ya está registrada.`);
          }
  
          viviendasVerificadas[viviendaKey] = true;
        }
  
        if (!persona.idPersona) {
          const existente = await this.personaService.findOneByDniWithManager(persona.dni, queryRunner.manager);
          if (existente) throw new Error(`La persona con DNI ${persona.dni} ya está registrada.`);
        }
  
        const edad = this.calcularEdad(persona.fecha_nacimiento);
        if (persona.titular_cotitular === 'Titular' && edad <= 18) {
          throw new Error(`La persona ${persona.nombre} no puede registrarse como titular porque es menor de edad.`);
        }
      }
  
      // Procesamiento
      const idsPersonasEnviadas: number[] = [];
  
      for (const item of personas) {
        const { persona, vivienda, ingresos, lote } = item;
        const viviendaKey = `${vivienda.direccion}-${vivienda.numero_direccion}-${vivienda.localidad}`;
  
        let viviendaProcesada = viviendasCreadas[viviendaKey];
        console.log('→ Vivienda recibida:', vivienda);
  
        if (vivienda.idVivienda) {
          console.log('→ ACTUALIZANDO VIVIENDA:', vivienda.idVivienda);
          viviendaProcesada = await this.viviendaService.updateVivienda(
            vivienda.idVivienda,
            vivienda,
            queryRunner.manager
          );
        } else if (!viviendaProcesada) {
          viviendaProcesada = await this.viviendaService.createVivienda(
            vivienda as CreateViviendaDto,
            queryRunner.manager,
            idRegistro
          );
        }
  
        viviendasCreadas[viviendaKey] = viviendaProcesada;
  
        if (persona.titular_cotitular === 'Titular' && !persona.idLote && lote) {
          const loteCreado = await this.loteService.createLote(lote as CreateLoteDto);
          persona.idLote = loteCreado.idLote;
        }
  
        let personaProcesada: Persona;
        if (persona.idPersona) {
          personaProcesada = await this.personaService.updatePersona(
            persona.idPersona,
            persona,
            idRegistro,
            queryRunner.manager
          );
        } else {
          personaProcesada = await this.personaService.createPersona(
            persona as CreatePersonaDto,
            viviendaProcesada.idVivienda,
            persona.idLote,
            idRegistro,
            queryRunner.manager
          );
        }
  
        idsPersonasEnviadas.push(personaProcesada.idPersona);
  
        const ingresosActuales = await queryRunner.manager.find(Ingreso, {
          where: { persona: { idPersona: personaProcesada.idPersona } }
        });
  
        const idsEnviados = (ingresos ?? []).filter(i => i.idIngreso).map(i => i.idIngreso);
  
        for (const ingresoExistente of ingresosActuales) {
          if (!idsEnviados.includes(ingresoExistente.idIngreso)) {
            await this.ingresoService.removeIngreso(ingresoExistente.idIngreso);
          }
        }
  
        for (const ingreso of ingresos ?? []) {
          if (ingreso.idIngreso) {
            await this.ingresoService.updateIngreso(ingreso.idIngreso, ingreso, queryRunner.manager);
          } else {
            await this.ingresoService.createIngreso(
              ingreso as CreateIngresoDto,
              personaProcesada.idPersona,
              queryRunner.manager
            );
          }
        }
  
        personasProcesadas.push(personaProcesada);
      }
  
      // ➖ Eliminar personas que ya no están en el array enviado
      const idsPersonasOriginales = registro.personas.map(p => p.idPersona);
      for (const idOriginal of idsPersonasOriginales) {
        if (!idsPersonasEnviadas.includes(idOriginal)) {
          console.log(`🗑 Eliminando persona con id ${idOriginal} que ya no está en el nuevo array`);
          await this.personaService.removePersona(idOriginal);
        }
      }
  
      await queryRunner.commitTransaction();
      return personasProcesadas;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error en la actualización',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
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
          await this.ingresoService.createIngreso([ingresoDto], idPersona);
        }
      }

      for (const ingreso of ingresosActuales) {
        if (!nuevosIds.includes(ingreso.idIngreso)) {
          await this.ingresoService.removeIngreso(ingreso.idIngreso);
        }
      }
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
      const registrosRaw = await this.registroRepository.find({
        relations: {
          personas: {
            ingresos: true,
            viviendas: true,
            lote: true,
          },
          viviendas: true,
        },
        order: {
          idRegistro: 'ASC'
        }
      });
  
      let registros = registrosRaw.map(registro => {
        return {
          idRegistro: registro.idRegistro,
          viviendas: registro.viviendas?.map(v => ({
            idVivienda: v.idVivienda,
            direccion: v.direccion,
            numero_direccion: v.numero_direccion,
            departamento: v.departamento,
            piso_departamento: v.piso_departamento,
            numero_departamento: v.numero_departamento,
            alquiler: v.alquiler,
            valor_alquiler: v.valor_alquiler,
            localidad: v.localidad,
            cantidad_dormitorios: v.cantidad_dormitorios,
            estado_vivienda: v.estado_vivienda,
            tipo_alquiler: v.tipo_alquiler
          })) || [],
          personas: registro.personas.map(persona => {
            const totalIngresos = persona.ingresos?.reduce((sum, ingreso) => sum + (ingreso.salario || 0), 0) || 0;
            return {
              idVivienda: persona.idVivienda,
              idRegistro: persona.idRegistro,
              idLote: persona.idLote,
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
          registro.viviendas.some(v => v.localidad === options.localidad)
        );
      }
  
      if (options?.titular !== undefined) {
        registros = registros.filter(registro =>
          registro.personas.some(p =>
            p.titular_cotitular === (options.titular ? 'Titular' : 'Cotitular')
          )
        );
      }
  
      registros.sort((a, b) => {
        const personaA = a.personas.find(p => p.titular_cotitular === 'Titular') || a.personas[0];
        const personaB = b.personas.find(p => p.titular_cotitular === 'Titular') || b.personas[0];
        const apellidoComparison = personaA.apellido.localeCompare(personaB.apellido);
        if (apellidoComparison !== 0) return apellidoComparison;
        return personaA.nombre.localeCompare(personaB.nombre);
      });
  
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
      relations: ['vivienda', 'lote', 'personas', 'personas.ingresos']
    });
  }

}

