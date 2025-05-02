import { CreateViviendaDto } from "src/vivienda/dto/create-vivienda.dto";
import { CreateIngresoDto } from "src/ingreso/dto/create-ingreso.dto";
import { CreateLoteDto } from "src/lote/dto/create-lote.dto";
import { CreatePersonaDto } from "src/persona/dto/create-persona.dto";


export class CreateRegistroDto { 

idRegistro: number;
  vivienda?: CreateViviendaDto;   // DTO para Vivienda
  lote?: CreateLoteDto;           // DTO para Lote
  ingreso?: CreateIngresoDto[];  // DTO para Ingresos
  persona?: CreatePersonaDto[];

}