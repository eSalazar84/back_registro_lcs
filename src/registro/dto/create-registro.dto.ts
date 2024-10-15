import { CreateViviendaDto } from "src/vivienda/dto/create-vivienda.dto";
import { CreateIngresoDto } from "src/ingreso/dto/create-ingreso.dto";
import { CreateLoteDto } from "src/lote/dto/create-lote.dto";
import { CreatePersonaDto } from "src/persona/dto/create-persona.dto";
import { Estado_Civil } from "src/persona/enum/estado_civil.enum";
import { Genero } from "src/persona/enum/genero.enum";
import { Nacionalidad } from "src/persona/enum/nacionalidad.enum";
import { Rol } from "src/persona/enum/rol.enum";
import { Titular_Cotitular } from "src/persona/enum/titular_cotitular.enum";
import { Vinculo } from "src/persona/enum/vinculo.enum";

export class CreateRegistroDto {
  nombre: string;
  apellido: string;
  tipo_dni: string;
  dni: number;
  CUIL_CUIT: number;
  genero: Genero;
  fecha_nacimiento: Date;
  email: string;
  telefono: string;
  estado_civil: Estado_Civil;
  nacionalidad: Nacionalidad;
  certificado_discapacidad: boolean;
  rol: Rol;
  vinculo: Vinculo;
  titular_cotitular: Titular_Cotitular;

  vivienda?: CreateViviendaDto;   // DTO para Vivienda
  lote?: CreateLoteDto;           // DTO para Lote
  ingreso?: CreateIngresoDto[];  // DTO para Ingresos
  persona?: CreatePersonaDto;
}

  