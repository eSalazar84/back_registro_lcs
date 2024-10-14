import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Tipo_DNI } from '../enum/tipo_dni.enum';
import { Genero } from '../enum/genero.enum';
import { Estado_Civil } from '../enum/estado_civil.enum';
import { Nacionalidad } from '../enum/nacionalidad.enum';
import { Vinculo } from '../enum/vinculo.enum';
import { Rol } from '../enum/rol.enum';
import { Titular_Cotitular } from '../enum/titular_cotitular.enum';

export class CreatePersonaDto {

    idPersona: number

    @IsOptional()
    @IsInt()
    numero_registro?: number; // Puede ser nulo o no

    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    apellido: string;

    @IsNotEmpty()
    @IsEnum(Tipo_DNI)
    tipo_dni: Tipo_DNI;

    @IsNotEmpty()
    @IsInt()
    dni: number;

    @IsNotEmpty()
    @IsInt()
    CUIL_CUIT: number;

    @IsNotEmpty()
    @IsEnum(Genero)
    genero: Genero;

    @IsOptional()
    fecha_nacimiento?: Date; // Puede ser nulo o no

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    telefono: string;

    @IsNotEmpty()
    @IsEnum(Estado_Civil)
    estado_civil: Estado_Civil;

    @IsNotEmpty()
    @IsEnum(Nacionalidad)
    nacionalidad: Nacionalidad;

    @IsNotEmpty()
    @IsBoolean()
    certificado_discapacidad: boolean;

    @IsNotEmpty()
    @IsEnum(Rol)
    rol: Rol;

    @IsOptional()
    @IsEnum(Vinculo)
    vinculo?: Vinculo | null; // Puede ser nulo o no

    @IsOptional()
    @IsEnum(Titular_Cotitular)
    titular_cotitular: Titular_Cotitular;

    @IsOptional()
    @IsInt()
    idVivienda?: number;
  
    @IsOptional()
    @IsInt()
    idLote?: number;
  
    
}
