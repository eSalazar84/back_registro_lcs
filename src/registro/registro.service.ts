import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Persona } from 'src/persona/entities/persona.entity';
import { Vivienda } from 'src/casa/entities/vivienda.entity';
import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
import { Lote } from 'src/lote/entities/lote.entity';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateViviendaDto } from 'src/casa/dto/create-vivienda.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { log } from 'console';
import { UpdateLoteDto } from 'src/lote/dto/update-lote.dto';

@Injectable()
export class RegistroService {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Vivienda)
    private viviendaRepository: Repository<Vivienda>,
    @InjectRepository(Ingreso)
    private ingresoRepository: Repository<Ingreso>, // Cambiado a entidad Ingreso

    @InjectRepository(Lote)
    private loteRepository: Repository<Lote>,
  ) {}

  async createAll(
    createPersonaDto: CreatePersonaDto,
    viviendaDto: CreateViviendaDto,
    ingresoDtos: CreateIngresoDto[] | CreateIngresoDto,
    loteDto: CreateLoteDto | UpdateLoteDto,
    
): Promise<Persona> {
   console.log("Inicio de createAll:", "personaIn",createPersonaDto, "viviendaIn",viviendaDto,"ingresoIn", ingresoDtos, "loteIn",loteDto);
  

    console.log("que contiene ingresoDto parametro", ingresoDtos);
    


    const loteFound= {...loteDto}
  console.log("que tiene loteFound", loteFound)
    // Verificar si el DNI ya está registrado
    const personaFound = await this.personaRepository.findOne({
        where: { dni: createPersonaDto.dni },
    });
    if (personaFound) {
        throw new HttpException(
            {
                status: HttpStatus.BAD_REQUEST,
                error: `DNI ya registrado`,
            },
            HttpStatus.BAD_REQUEST
        );
    }
  
    // Crear y guardar la Vivienda
    const vivienda = this.viviendaRepository.create(viviendaDto);
    const savedVivienda = await this.viviendaRepository.save(vivienda);
   // console.log("Vivienda guardada:", savedVivienda);
  
    // Crear y guardar el Lote
    console.log("que tiene loteDto",loteFound)
    const lote = this.loteRepository.create( loteDto );
    console.log("que tiene lote", lote)
    const savedLote = await this.loteRepository.save(lote);
   console.log("Lote guardado:", savedLote);
  


    // Crear la Persona
    const persona = this.personaRepository.create({
        ...createPersonaDto,
        vivienda: {idVivienda: savedVivienda.idVivienda},
        lote: {idLote: savedLote.idLote},
    });
    const savedPersona = await this.personaRepository.save(persona);
   // console.log("Persona guardada:", savedPersona);

   // asignar id de persona a lote

// Obtener solo el id de la persona para lote
const personaId = savedPersona.idPersona;

// Asignar solo el id de persona al lote y guardarlo
await this.loteRepository.save({
    ...savedLote,
    persona: { idPersona: personaId } // Asignar solo el id de la persona
});

    // Crear los Ingresos
    const ingresosArray = Array.isArray(ingresoDtos) ? ingresoDtos : [ingresoDtos];
    console.log("Ingresos a crear:", ingresosArray);
    const ingresos = [];
  
    // Verificar que savedPersona esté definido
    if (!savedPersona) {
       // console.error("La persona no se ha guardado correctamente.");
        return; // O lanza una excepción
    }
  
    for (const ingresoDto of ingresosArray) {
        if (typeof ingresoDto === 'object' && ingresoDto !== null) {
          //  console.log("Creando ingreso con datos:", ingresoDto);
            
            const ingreso = this.ingresoRepository.create({
                ...ingresoDto,
                persona:  { idPersona: savedPersona.idPersona }, // Asociar la persona creada
            });
  
            // Guardar el ingreso
            const savedIngreso = await this.ingresoRepository.save(ingreso);
            console.log("Ingreso guardado:", savedIngreso);
  
            // Comprobar si se guardó correctamente
            if (savedIngreso) {
               // console.log("Ingreso guardado exitosamente:", savedIngreso);
                ingresos.push(savedIngreso);
            } else {
               // console.error("Error al guardar el ingreso.");
            }
        } else {
           // console.error("Ingreso inválido:", ingresoDto);
        }
    }
  
    // Actualizar la Persona con los Ingresos
    // console.log("Actualizando persona con ingresos:", ingresos);
    savedPersona.ingresos = ingresos as Ingreso[];
    await this.personaRepository.save(savedPersona);
   // console.log("Persona actualizada:", savedPersona);
  
    // Asociar la persona al lote
    // savedLote.persona = savedPersona;
    // await this.loteRepository.save(savedLote);
   // console.log("Lote actualizado con la persona:", savedLote);
  
    console.log("Fin de createAll. Persona retornada:", savedPersona);
    return savedPersona;
}

  
}
